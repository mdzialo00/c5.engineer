import { profile } from "@c5-engineer/lib/profile";
import { connection } from "next/server";

export default async function Footer() {
  await connection();
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto mt-auto w-full max-w-[640px] px-6 pb-10 text-center text-sm text-muted">
      © {year} {profile.name}. All rights reserved.
    </footer>
  );
}
