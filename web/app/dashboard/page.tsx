"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import {
  ambilTokoSaya,
  bukaToko,
  ambilProdukSaya,
  tambahProduk,
  hapusProduk,
  ubahStok,
} from "./actions";
import { upload } from "@vercel/blob/client";

type Toko = { id: number; nama: string; slug: string } | null;
type Produk = {
  id: number;
  nama: string;
  harga: number;
  gambar: string | null;
  stok: number;
};

const kolom =
  "w-full rounded-full border-2 border-hijau bg-transparent px-5 py-3";
const tombol = "w-full rounded-full bg-hijau px-5 py-3 font-semibold text-krem";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [toko, setToko] = useState<Toko | undefined>(undefined);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mengunggah, setMengunggah] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) {
      ambilTokoSaya().then(setToko);
      ambilProdukSaya().then(setProduk);
    }
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

  async function handleTambah(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    setMengunggah(true);
    try {
      const file = data.get("gambar");
      if (file instanceof File && file.size > 0) {
        const blob = await upload(`produk/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        data.set("gambar", blob.url);
      } else {
        data.delete("gambar");
      }
      const hasil = await tambahProduk(data);
      if (hasil.error) {
        setError(hasil.error);
      } else {
        form.reset();
        setProduk(await ambilProdukSaya());
      }
    } catch {
      setError("Gagal mengunggah gambar. Coba lagi.");
    } finally {
      setMengunggah(false);
    }
  }

  async function handleHapus(id: number) {
    await hapusProduk(id);
    setProduk(await ambilProdukSaya());
  }

  async function handleUbahStok(p: Produk) {
    setError(null);
    const masuk = window.prompt(`Stok baru untuk ${p.nama}:`, String(p.stok));
    if (masuk === null || masuk.trim() === "") return;
    const hasil = await ubahStok(p.id, Number(masuk));
    if (hasil.error) {
      setError(hasil.error);
    } else {
      setProduk(await ambilProdukSaya());
    }
  }

  if (isPending) return <p className="mt-8 text-center">Memuat...</p>;
  if (!session?.user) return <p className="mt-8 text-center">Mengalihkan...</p>;

  const { user } = session;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-6 py-10">
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
            className={kolom}
          />
          <button type="submit" className={tombol}>
            Buka toko
          </button>
        </form>
      )}

      {toko && (
        <>
          <div className="rounded-3xl bg-kartu p-5">
            <p className="text-sm opacity-70">Toko kamu</p>
            <p className="font-judul text-xl font-bold text-hijau">
              {toko.nama}
            </p>
            <Link
              href={`/toko/${toko.slug}`}
              className="mt-2 inline-block text-sm font-semibold text-hijau underline"
            >
              Lihat etalase
            </Link>
            <Link
              href="/dashboard/pesanan"
              className="mt-2 ml-4 inline-block text-sm font-semibold text-hijau underline"
            >
              Pesanan masuk
            </Link>
          </div>

          <form onSubmit={handleTambah} className="space-y-3">
            <p className="font-semibold">Tambah produk</p>
            {error && <p className="text-red-600">{error}</p>}
            <input
              name="nama"
              placeholder="Nama produk"
              required
              className={kolom}
            />
            <input
              name="harga"
              type="number"
              placeholder="Harga (rupiah)"
              required
              min={100}
              className={kolom}
            />
            <input
              name="stok"
              type="number"
              placeholder="Stok"
              required
              min={0}
              defaultValue={1}
              className={kolom}
            />
            <input
              name="gambar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="w-full text-sm"
            />
            <button type="submit" disabled={mengunggah} className={tombol}>
              {mengunggah ? "Mengunggah..." : "Tambah produk"}
            </button>
          </form>

          <div className="space-y-2">
            <p className="font-semibold">Produk di tokomu ({produk.length})</p>
            {produk.length === 0 && (
              <p className="text-sm opacity-70">Belum ada produk.</p>
            )}
            {produk.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-kartu px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {p.gambar && (
                    <img
                      src={p.gambar}
                      alt={p.nama}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{p.nama}</p>
                    <p className="text-sm text-hijau">
                      Rp{p.harga.toLocaleString("id-ID")}
                    </p>
                    <p className="text-sm opacity-70">
                      {p.stok === 0 ? "Stok habis" : `Stok: ${p.stok}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => handleUbahStok(p)}
                    className="text-sm font-semibold text-hijau"
                  >
                    Ubah stok
                  </button>
                  <button
                    onClick={() => handleHapus(p.id)}
                    className="text-sm font-semibold text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        onClick={() =>
          signOut({ fetchOptions: { onSuccess: () => router.push("/") } })
        }
        className="w-full rounded-full border-2 border-hijau px-5 py-3 font-semibold text-hijau"
      >
        Keluar
      </button>
    </main>
  );
}
