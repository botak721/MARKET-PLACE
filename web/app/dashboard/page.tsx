"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) return <p className="mt-8 text-center">Memuat...</p>;
  if (!session?.user) return <p className="mt-8 text-center">Mengalihkan...</p>;

  const { user } = session;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="font-judul text-3xl font-bold text-hijau">Dashboard</h1>
      <p>Halo, {user.name}!</p>
      <p>Email: {user.email}</p>
      <button
        onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
        className="w-full rounded-full bg-hijau px-5 py-3 font-semibold text-krem"
      >
        Keluar
      </button>
    </main>
  );
}