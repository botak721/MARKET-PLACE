"use client";

import { useState } from "react";

export type TitikPenjualan = {
  tanggal: string;
  label: string;
  total: number;
  pesanan: number;
};

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

function formatSingkat(n: number) {
  if (n >= 1_000_000) {
    const jt = n / 1_000_000;
    return `Rp${jt % 1 === 0 ? jt.toFixed(0) : jt.toFixed(1).replace(".", ",")}jt`;
  }
  if (n >= 1_000) {
    const rb = Math.round(n / 1_000);
    return `Rp${rb}rb`;
  }
  return `Rp${n}`;
}

export default function GrafikPenjualan({ data }: { data: TitikPenjualan[] }) {
  const [rentang, setRentang] = useState<7 | 30>(7);
  const [terpilih, setTerpilih] = useState<number | null>(null);

  const seri = rentang === 7 ? data.slice(-7) : data;
  const totalPendapatan = seri.reduce((s, d) => s + d.total, 0);
  const totalPesanan = seri.reduce((s, d) => s + d.pesanan, 0);

  const maksMentah = Math.max(...seri.map((d) => d.total), 0);
  const maks = maksMentah > 0 ? maksMentah : 100_000;

  // Dimensi SVG
  const lebar = 680;
  const tinggi = 220;
  const padKiri = 58;
  const padKanan = 16;
  const padAtas = 20;
  const padBawah = 34;
  const areaLebar = lebar - padKiri - padKanan;
  const areaTinggi = tinggi - padAtas - padBawah;

  const langkahX = seri.length > 0 ? areaLebar / seri.length : areaLebar;
  const lebarBatang = Math.min(34, Math.max(8, langkahX * 0.56));

  const garisY = [0, 0.5, 1];
  const indeksAktif =
    terpilih !== null && terpilih < seri.length ? terpilih : null;
  const titikAktif = indeksAktif !== null ? seri[indeksAktif] : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-kartu">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-judul text-lg font-bold">Tren penjualan</h3>
          <p className="mt-0.5 text-sm text-slate-600 tabular-nums">
            <span className="font-bold text-tinta">
              {rupiah(totalPendapatan)}
            </span>{" "}
            dari {totalPesanan} pesanan ({rentang} hari terakhir)
          </p>
        </div>

        <div
          role="group"
          aria-label="Rentang waktu grafik"
          className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1"
        >
          {([7, 30] as const).map((hari) => {
            const aktif = rentang === hari;
            return (
              <button
                key={hari}
                type="button"
                onClick={() => {
                  setRentang(hari);
                  setTerpilih(null);
                }}
                aria-pressed={aktif}
                className={`min-h-9 rounded-full px-4 text-xs font-semibold transition-colors ${
                  aktif
                    ? "bg-biru text-white shadow-sm"
                    : "text-slate-600 hover:text-tinta"
                }`}
              >
                {hari} Hari
              </button>
            );
          })}
        </div>
      </div>

      {/* Info titik yang di-hover / dipilih */}
      <div className="mt-3 flex min-h-7 items-center">
        {titikAktif ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-biru-tua tabular-nums">
            <span>{titikAktif.label}:</span>
            <span className="font-bold">{rupiah(titikAktif.total)}</span>
            <span className="text-slate-600">
              ({titikAktif.pesanan} pesanan)
            </span>
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            {maksMentah === 0
              ? `Belum ada penjualan tercatat dalam ${rentang} hari terakhir.`
              : "Arahkan kursor atau ketuk batang grafik untuk melihat detail harian."}
          </p>
        )}
      </div>

      <div className="mt-2 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${lebar} ${tinggi}`}
          role="img"
          aria-label={`Grafik penjualan ${rentang} hari terakhir`}
          className="h-auto w-full min-w-[460px] select-none"
          onMouseLeave={() => setTerpilih(null)}
        >
          {/* Garis grid horizontal & label sumbu Y */}
          {garisY.map((rasio) => {
            const y = padAtas + areaTinggi * (1 - rasio);
            const nilai = Math.round(maks * rasio);
            return (
              <g key={rasio}>
                <line
                  x1={padKiri}
                  y1={y}
                  x2={lebar - padKanan}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={rasio === 0 ? undefined : "4 4"}
                  strokeWidth="1"
                />
                <text
                  x={padKiri - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[11px]"
                >
                  {formatSingkat(nilai)}
                </text>
              </g>
            );
          })}

          {/* Batang grafik */}
          {seri.map((d, i) => {
            const tinggiBatang =
              d.total > 0 ? Math.max(4, (d.total / maks) * areaTinggi) : 2;
            const xPusat = padKiri + langkahX * i + langkahX / 2;
            const x = xPusat - lebarBatang / 2;
            const y = padAtas + areaTinggi - tinggiBatang;
            const aktif = indeksAktif === i;

            // Tampilkan label X tiap hari (untuk 7 hari) atau tiap 5 hari (untuk 30 hari)
            const tampilLabel =
              rentang === 7 || i % 5 === 0 || i === seri.length - 1;

            return (
              <g
                key={d.tanggal}
                className="cursor-pointer"
                onMouseEnter={() => setTerpilih(i)}
                onClick={() => setTerpilih(aktif ? null : i)}
              >
                {/* Area sentuh transparan agar mudah diklik/hover */}
                <rect
                  x={padKiri + langkahX * i}
                  y={padAtas}
                  width={langkahX}
                  height={areaTinggi + padBawah}
                  fill="transparent"
                />

                {/* Batang */}
                <rect
                  x={x}
                  y={y}
                  width={lebarBatang}
                  height={tinggiBatang}
                  rx={Math.min(6, lebarBatang / 2)}
                  fill={
                    d.total === 0
                      ? "#e2e8f0"
                      : aktif
                        ? "#1d4ed8"
                        : "#2563eb"
                  }
                  className="transition-colors duration-150"
                />

                {/* Label sumbu X */}
                {tampilLabel && (
                  <text
                    x={xPusat}
                    y={tinggi - 10}
                    textAnchor="middle"
                    className={`text-[11px] ${
                      aktif ? "fill-biru font-bold" : "fill-slate-500"
                    }`}
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
