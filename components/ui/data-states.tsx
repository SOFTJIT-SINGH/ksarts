import * as React from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** Shown when a table has no rows yet (real empty database, not an error). */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">{title}</p>
          {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

/** Shown when the database could not be read (network down, wrong keys...). */
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
      <div>
        <p className="font-bold">Could not load data from the database</p>
        <p className="mt-0.5">{message} Refresh the page to try again.</p>
      </div>
    </div>
  );
}
