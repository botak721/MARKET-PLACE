"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ambilKeranjang, ubahJumlah, hapusDariKeranjang } from "./actions";

type Item = Awaited<ReturnType<typeof ambilKeranjang>>[number];

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default function KeranjangPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [item, setItem] = useState<Item[] | undefined>(undefined);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/sign-in");
  }, [isPending, session, router]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) ambilKeranjang().then(setItem);
  }, [userId]);

  async function ubah(productId: number, jumlah: number) {
    await ubahJumlah(productId, jumlah);
    setItem(await ambilKeranjang());
  }

  async function hapus(productId: number) {
    await hapusDariKeranjang(productId);
    setItem(await ambilKeranjang());
  }

  if (isPending || item === undefined) {
    return <p className="mt-8 text-center">Memuat keranjang...</p>;
  }

  const perToko = Object.values(
    item.reduce<Record<number, { toko: string; barang: Item[] }>>((acc, i) => {
      (acc[i.tokoId] ??= { toko: i.toko, barang: [] }).barang.push(i);
      return acc;
    }, {}),
  );
  const total = item.reduce((s, i) => s + i.harga * i.jumlah, 0);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm font-semibold text-hijau underline">
        Kembali belanja
      </Link>
      <h1 className="font-judul mt-3 text-3xl font-bold text-hijau">Keranjang</h1>

      {item.length === 0 && <p className="mt-6">Keranjangmu masih kosong.</p>}

      <div className="mt-6 space-y-6">
        {perToko.map((grup) => (
          <section key={grup.toko} className="rounded-3xl bg-kartu p-5">
            <h2 className="font-judul text-lg font-bold text-hijau">{grup.toko}</h2>
            <div className="mt-3 space-y-4">
              {grup.barang.map((b) => (
                <div key={b.productId} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{b.nama}</p>
                    <p className="text-sm text-hijau">{rupiah(b.harga)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => ubah(b.productId, b.jumlah - 1)}
                      className="h-8 w-8 rounded-full border-2 border-hijau font-semibold text-hijau"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{b.jumlah}</span>
                    <button
                      onClick={() => ubah(b.productId, b.jumlah + 1)}
                      className="h-8 w-8 rounded-full border-2 border-hijau font-semibold text-hijau"
                    >
                      +
                    </button>
                    <button
                      onClick={() => hapus(b.productId)}
                      className="ml-2 text-sm font-semibold text-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-right text-sm">
              Subtotal toko:{" "}
              <span className="font-semibold">
                {rupiah(grup.barang.reduce((s, b) => s + b.harga * b.jumlah, 0))}
              </span>
            </p>
          </section>
        ))}
      </div>

      {item.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-3xl bg-kartu p-5">
          <p className="font-semibold">Total: {rupiah(total)}</p>
          <button
            disabled
            className="rounded-full bg-hijau px-5 py-3 font-semibold text-krem opacity-50"
          >
            Checkout (segera)
          </button>
        </div>
      )}
    </main>
  );
}