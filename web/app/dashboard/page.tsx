"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { ambilTokoSaya, bukaToko } from "./actions";

type Toko = { id: number; nama: string; slug: string } | null;

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [toko, setToko] = useState<Toko | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) ambilTokoSaya().then(setToko);
  }, [userId]);

  async function handleBukaToko(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const hasil = await bukaToko(new FormData(e.currentTarget));
    if (hasil.error) {
      setError(hasil.error);
    } else {
      setToko(await ambilTokoSaya());
    }
  }

  if (isPending) return <p className="mt-8 text-center">Memuat...</p>;
  if (!session?.user) return <p className="mt-8 text-center">Mengalihkan...</p>;

  const { user } = session;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="font-judul text-3xl font-bold text-hijau">Dashboard</h1>
      <p>Halo, {user.name}!</p>

      {toko === undefined && <p>Memuat toko...</p>}

      {toko === null && (
        <form onSubmit={handleBukaToko} className="space-y-3">
          <p className="font-semibold">Mau jualan? Buka tokomu.</p>
          {error && <p className="text-red-600">{error}</p>}
          <input
            name="nama"
            placeholder="Nama toko"
            required
            minLength={3}
            className="w-full rounded-full border-2 border-hijau bg-transparent px-5 py-3"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-hijau px-5 py-3 font-semibold text-krem"
          >
            Buka toko
          </button>
        </form>
      )}

      {toko && (
        <div className="rounded-3xl bg-kartu p-5">
          <p className="text-sm opacity-70">Toko kamu</p>
          <p className="font-judul text-xl font-bold text-hijau">{toko.nama}</p>
        </div>
      )}

      <button
        onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
        className="w-full rounded-full border-2 border-hijau px-5 py-3 font-semibold text-hijau"
      >
        Keluar
      </button>
    </main>
  );
}