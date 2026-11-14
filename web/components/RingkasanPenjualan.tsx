"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ambilRingkasan } from "@/app/dashboard/actions";
import { warnaDari } from "@/lib/warna";

type Ringkasan = NonNullable<Awaited<ReturnType<typeof ambilRingkasan>>>;

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default function RingkasanPenjualan({
  tokoId,
  tokoNama,
  produk,
}: {
  tokoId: number;
  tokoNama: string;
  produk: { nama: string; gambar: string | null }[];
}) {
  const [data, setData] = useState<Ringkasan | null>(null);

  useEffect(() => {
    ambilRingkasan().then(setData);
  }, [tokoId]);

  const kartu =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-kartu";

  if (!data) {
    return (
      <div aria-busy="true" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  const warna = warnaDari(tokoNama);

  return (
    <section aria-labelledby="judul-ringkasan" className="space-y-6">
      <h2 id="judul-ringkasan" className="font-judul text-xl font-bold">
        Ringkasan operasional
      </h2>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={kartu}>
          <dt className="text-xs text-slate-600">Penjualan selesai</dt>
          <dd className="font-judul mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl">
            {rupiah(data.pendapatan)}
          </dd>
          <p className="mt-1 text-xs text-slate-600">dari {data.selesai} pesanan</p>
        </div>
        <Link
          href="/dashboard/pesanan"
          className={`${kartu} transition-shadow hover:shadow-kartu-naik`}
        >
          <dt className="text-xs text-slate-600">Perlu diproses</dt>
          <dd
            className={`font-judul mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl ${data.perluDiproses > 0 ? "text-red-600" : ""}`}
          >
            {data.perluDiproses} pesanan
          </dd>
          <p className="mt-1 text-xs text-slate-600">Buka pesanan masuk</p>
        </Link>
        <Link
          href="/dashboard/pesanan"
          className={`${kartu} transition-shadow hover:shadow-kartu-naik`}
        >
          <dt className="text-xs text-slate-600">Dikemas dan dikirim</dt>
          <dd className="font-judul mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl">
            {data.dalamProses} pesanan
          </dd>
          <p className="mt-1 text-xs text-slate-600">Menunggu pembeli menerima</p>
        </Link>
        <div className={kartu}>
          <dt className="text-xs text-slate-600">Produk di tokomu</dt>
          <dd className="font-judul mt-1 text-2xl font-extrabold tabular-nums sm:text-3xl">
            {produk.length}
          </dd>
          <p className="mt-1 text-xs text-slate-600">Termasuk yang stoknya habis</p>
        </div>
      </dl>

      {data.terlaris.length > 0 && (
        <div>
          <h3 className="font-judul text-lg font-bold">Produk terlaris</h3>
          <ol className="mt-3 grid gap-4 md:grid-cols-3">
            {data.terlaris.map((t, i) => {
              const p = produk.find((x) => x.nama === t.nama);
              return (
                <li
                  key={t.nama}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-kartu"
                >
                  <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {p?.gambar ? (
                      <img
                        src={p.gambar}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="font-judul flex h-full w-full items-center justify-center text-xl font-bold"
                        style={{ backgroundColor: warna.bg, color: warna.teks }}
                      >
                        {(Array.from(t.nama.trim())[0] ?? "?").toUpperCase()}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-biru">Peringkat {i + 1}</p>
                    <p className="line-clamp-2 font-bold">{t.nama}</p>
                    <p className="text-sm text-slate-600 tabular-nums">
                      {t.terjual} terjual
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
