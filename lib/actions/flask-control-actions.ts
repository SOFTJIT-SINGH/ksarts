"use server";

import { spawn, execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getCurrentUserAction } from "@/lib/actions/auth-actions";

// LEARNING NOTE: Start/stop the Flask ML service from the website
//   what:     A Server Action that launches `python app.py` as a background process on the
//             same machine that runs Next.js, and can stop it again
//   why:      So you don't have to open a terminal and type the command every time
//   without:  Flask had to be started by hand before every demo
//   remember: This only works when Next.js runs on YOUR computer (npm run dev / npm start).
//             Vercel is serverless, it cannot keep a Python process alive, so it is disabled there.

const FLASK_URL = process.env.FLASK_AI_SERVICE_URL || "http://127.0.0.1:5000/api/v1/predict";
const FLASK_BASE = FLASK_URL.replace(/\/api\/v1.*$/, "") || FLASK_URL;
const FLASK_DIR = path.join(process.cwd(), "flask_service");
const LOG_FILE = path.join(FLASK_DIR, "flask.log");

type GlobalWithPid = typeof globalThis & { __flaskPid?: number };
const g = globalThis as GlobalWithPid;

export type FlaskControlResult = { success: boolean; message?: string; error?: string };

export async function canControlFlask(): Promise<boolean> {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_FLASK_LAUNCH === "true";
}

async function assertAdminAndLocal(): Promise<string | null> {
  const current = await getCurrentUserAction();
  if (!current.success || current.user?.role !== "admin") {
    return "Only the Admin can start or stop the ML service.";
  }
  if (!(await canControlFlask())) {
    return "Starting Flask from the website only works when the app runs on your own computer (not on Vercel).";
  }
  return null;
}

async function isFlaskUp(): Promise<boolean> {
  try {
    const res = await fetch(`${FLASK_BASE}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}

// Prefer the project's own virtualenv, then fall back to whatever python is on PATH.
function pythonCandidates(): string[] {
  const isWin = process.platform === "win32";
  const venvDirs = [".venv", "venv"];
  const found: string[] = [];
  for (const dir of venvDirs) {
    for (const base of [FLASK_DIR, process.cwd()]) {
      const p = isWin
        ? path.join(base, dir, "Scripts", "python.exe")
        : path.join(base, dir, "bin", "python");
      if (fs.existsSync(p)) found.push(p);
    }
  }
  if (process.env.FLASK_PYTHON) found.unshift(process.env.FLASK_PYTHON);
  return [...found, ...(isWin ? ["python", "py", "python3"] : ["python3", "python"])];
}

function launch(command: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const out = fs.openSync(LOG_FILE, "a");
    const child = spawn(command, ["app.py"], {
      cwd: FLASK_DIR,
      detached: true,
      stdio: ["ignore", out, out],
      windowsHide: true,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });
    child.once("error", (err) => {
      fs.closeSync(out);
      reject(err);
    });
    child.once("spawn", () => {
      child.unref();
      fs.closeSync(out);
      resolve(child.pid ?? 0);
    });
  });
}

function tailLog(lines = 6): string {
  try {
    return fs.readFileSync(LOG_FILE, "utf-8").trim().split(/\r?\n/).slice(-lines).join("\n");
  } catch {
    return "";
  }
}

export async function startFlaskAction(): Promise<FlaskControlResult> {
  try {
    const denied = await assertAdminAndLocal();
    if (denied) return { success: false, error: denied };

    if (await isFlaskUp()) {
      return { success: true, message: "Flask ML service is already running." };
    }
    if (!fs.existsSync(path.join(FLASK_DIR, "app.py"))) {
      return { success: false, error: "flask_service/app.py was not found next to the Next.js project." };
    }

    fs.appendFileSync(LOG_FILE, `\n--- Started from website ${new Date().toISOString()} ---\n`);

    let pid = 0;
    let lastError = "";
    for (const cmd of pythonCandidates()) {
      try {
        pid = await launch(cmd);
        break;
      } catch (err: any) {
        lastError = `${cmd}: ${err?.code || err?.message}`;
      }
    }
    if (!pid) {
      return {
        success: false,
        error: `Python was not found (${lastError}). Install Python 3 and run "pip install -r flask_service/requirements.txt", or set FLASK_PYTHON in .env.`,
      };
    }
    g.__flaskPid = pid;

    // Flask imports pandas/scikit-learn/mlxtend, so give it time to come up (up to ~25s).
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await isFlaskUp()) {
        return { success: true, message: "Flask ML service started." };
      }
    }

    const tail = tailLog();
    return {
      success: false,
      error: `Flask did not respond in time.${tail ? `\nLast log lines:\n${tail}` : ""}\n(Missing packages? Run: pip install -r flask_service/requirements.txt)`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to start Flask." };
  }
}

export async function stopFlaskAction(): Promise<FlaskControlResult> {
  try {
    const denied = await assertAdminAndLocal();
    if (denied) return { success: false, error: denied };

    const pid = g.__flaskPid;
    if (!pid) {
      return {
        success: false,
        error: "This Flask instance was not started from the website, so it can't be stopped here. Close its terminal window instead.",
      };
    }

    await new Promise<void>((resolve) => {
      if (process.platform === "win32") {
        // /T also kills child processes, /F forces it
        execFile("taskkill", ["/PID", String(pid), "/T", "/F"], () => resolve());
      } else {
        try {
          process.kill(-pid, "SIGTERM");
        } catch {
          try {
            process.kill(pid, "SIGTERM");
          } catch {
            /* already gone */
          }
        }
        resolve();
      }
    });
    g.__flaskPid = undefined;

    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (!(await isFlaskUp())) return { success: true, message: "Flask ML service stopped." };
    }
    return { success: false, error: "Flask is still responding after the stop request." };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to stop Flask." };
  }
}
