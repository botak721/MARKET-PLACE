"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ambilKeranjang } from "@/app/keranjang/actions";
import { buatPesanan } from "@/app/pesanan/actions";

type Item = Awaited<ReturnType<typeof ambilKeranjang>>[number];

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [item, setItem] = useState<Item[] | undefined>(undefined);
  const [alamat, setAlamat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/sign-in");
  }, [isPending, session, router]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) ambilKeranjang().then(setItem);
  }, [userId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setProses(true);
    const hasil = await buatPesanan(alamat);
    setProses(false);
    if (hasil.error) setError(hasil.error);
    else router.push("/pesanan");
  }

  if (isPending || item === undefined) {
    return <p className="mt-8 text-center">Memuat...</p>;
  }

  if (item.length === 0) {
    return (
      <main className="mx-auto max-w-md px-6 py-10">
        <p>Keranjangmu kosong.</p>
        <Link href="/" className="font-semibold text-hijau underline">
          Mulai belanja
        </Link>
      </main>
    );
  }

  const jumlahToko = new Set(item.map((i) => i.tokoId)).size;
  const total = item.reduce((s, i) => s + i.harga * i.jumlah, 0);

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <Link href="/keranjang" className="text-sm font-semibold text-hijau underline">
        Kembali ke keranjang
      </Link>
      <h1 className="font-judul mt-3 text-3xl font-bold text-hijau">Checkout</h1>

      <div className="mt-6 rounded-3xl bg-kartu p-5">
        <p>
          {item.length} barang dari {jumlahToko} toko
        </p>
        <p className="mt-1 font-semibold">Total: {rupiah(total)}</p>
        {jumlahToko > 1 && (
          <p className="mt-2 text-sm opacity-70">
            Pesananmu akan dipecah jadi {jumlahToko} pesanan, satu untuk tiap toko.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <label className="font-semibold" htmlFor="alamat">
          Alamat pengiriman
        </label>
        {error && <p className="text-red-600">{error}</p>}
        <textarea
          id="alamat"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          required
          minLength={10}
          rows={4}
          placeholder="Nama penerima, jalan, kota, kode pos, nomor HP"
          className="w-full rounded-3xl border-2 border-hijau bg-transparent px-5 py-3"
        />
        <button
          type="submit"
          disabled={proses}
          className="w-full rounded-full bg-hijau px-5 py-3 font-semibold text-krem disabled:opacity-50"
        >
          {proses ? "Memproses..." : "Buat pesanan"}
        </button>
      </form>
    </main>
  );
}