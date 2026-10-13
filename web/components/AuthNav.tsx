"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export default function AuthNav() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div className="h-10 w-32" />;

  if (session?.user) {
    return (
      <nav className="flex items-center gap-3 whitespace-nowrap">
        <Link
          href="/dashboard"
          className="rounded-full bg-hijau px-4 py-2 font-semibold text-krem"
        >
          Dashboard
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-3 whitespace-nowrap">
      <Link href="/sign-in" className="font-semibold text-hijau">
        Masuk
      </Link>
      <Link
        href="/sign-up"
        className="rounded-full bg-hijau px-4 py-2 font-semibold text-krem"
      >
        Daftar
      </Link>
    </nav>
  );
}