"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ambilRingkasan } from "@/app/dashboard/actions";

type Ringkasan = NonNullable<Awaited<ReturnType<typeof ambilRingkasan>>>;

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default function RingkasanPenjualan({ tokoId }: { tokoId: number }) {
  const [data, setData] = useState<Ringkasan | null>(null);

  useEffect(() => {
    ambilRingkasan().then(setData);
  }, [tokoId]);

  if (!data) return null;

  return (
    <section className="space-y-3">
      <div className="rounded-3xl bg-hijau p-5 text-krem">
        <p className="text-sm opacity-80">Penjualan selesai</p>
        <p className="font-judul text-3xl font-bold">{rupiah(data.pendapatan)}</p>
        <p className="mt-1 text-sm opacity-80">dari {data.selesai} pesanan</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/pesanan" className="rounded-3xl bg-kartu p-4">
          <p className="text-sm opacity-70">Perlu diproses</p>
          <p className="font-judul text-2xl font-bold text-hijau">
            {data.perluDiproses}
          </p>
        </Link>
        <Link href="/dashboard/pesanan" className="rounded-3xl bg-kartu p-4">
          <p className="text-sm opacity-70">Dikemas dan dikirim</p>
          <p className="font-judul text-2xl font-bold text-hijau">
            {data.dalamProses}
          </p>
        </Link>
      </div>

      {data.terlaris.length > 0 && (
        <div className="rounded-3xl bg-kartu p-4">
          <p className="font-semibold">Terlaris</p>
          <ol className="mt-2 space-y-1 text-sm">
            {data.terlaris.map((t, i) => (
              <li key={t.nama} className="flex justify-between gap-3">
                <span>
                  {i + 1}. {t.nama}
                </span>
                <span className="opacity-70">{t.terjual} terjual</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}