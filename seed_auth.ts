import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#]+?)=(.+)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

async function run() {
  console.log("Starting Auth Seeder...");
  
  // Dynamically import supabase client so env vars are set first
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  console.log("Seeding Admin User (khushi.soni@ksarts.in)...");
  const adminRes = await supabase.auth.signUp({
    email: 'khushi.soni@ksarts.in',
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Khushi Soni',
        role: 'admin',
        phone: '9876543210'
      }
    }
  });

  if (adminRes.error) {
    console.error("Admin Seed Error:", adminRes.error.message);
  } else {
    console.log("Admin seeded successfully:", adminRes.data.user?.id);
  }

  console.log("Seeding Employee User (priya.sharma@ksarts.in)...");
  const empRes = await supabase.auth.signUp({
    email: 'priya.sharma@ksarts.in',
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Priya Sharma',
        role: 'employee',
        phone: '9876543211'
      }
    }
  });

  if (empRes.error) {
    console.error("Employee Seed Error:", empRes.error.message);
  } else {
    console.log("Employee seeded successfully:", empRes.data.user?.id);
  }
}

run();
