"use client";

import { Check } from "lucide-react";

const LANGKAH = [
  { kode: "MENUNGGU_BAYAR", label: "Menunggu Bayar" },
  { kode: "MENUNGGU", label: "Diproses" },
  { kode: "DIPROSES", label: "Dikemas" },
  { kode: "DIKIRIM", label: "Dikirim" },
  { kode: "SELESAI", label: "Selesai" },
];

function indeksAktif(status: string): number {
  const idx = LANGKAH.findIndex((l) => l.kode === status);
  return idx === -1 ? -1 : idx;
}

export default function StepperPesanan({ status }: { status: string }) {
  if (status === "DIBATALKAN") {
    return (
      <div className="mx-5 my-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 border border-red-200">
        <span aria-hidden="true" className="text-base">✕</span>
        Pesanan dibatalkan
      </div>
    );
  }

  const aktif = indeksAktif(status);

  return (
    <div className="px-5 py-4">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start gap-0 w-full">
        {LANGKAH.map((langkah, i) => {
          const selesai = i < aktif;
          const sedang = i === aktif;

          return (
            <div key={langkah.kode} className="flex flex-1 flex-col items-center relative">
              {/* Garis penghubung kiri */}
              {i > 0 && (
                <div
                  className="absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2"
                  style={{
                    backgroundColor: selesai || sedang ? "#2563eb" : "#e2e8f0",
                    left: "-50%",
                    right: "50%",
                    width: "100%",
                    top: "16px",
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Lingkaran */}
              <div
                className={[
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                  selesai || sedang
                    ? "text-white"
                    : "bg-slate-200 text-slate-500",
                ].join(" ")}
                style={
                  selesai
                    ? { backgroundColor: "#2563eb" }
                    : sedang
                    ? {
                        backgroundColor: "#2563eb",
                        boxShadow: "0 0 0 4px rgba(37,99,235,0.2)",
                      }
                    : undefined
                }
                aria-label={`${langkah.label}: ${selesai ? "selesai" : sedang ? "sedang berlangsung" : "belum"}`}
              >
                {selesai ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : sedang ? (
                  <span className="h-2 w-2 rounded-full bg-white block" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-400 block" />
                )}
              </div>

              {/* Label */}
              <span
                className={[
                  "mt-2 text-center text-[11px] font-semibold leading-tight",
                  selesai || sedang ? "text-biru" : "text-slate-400",
                ].join(" ")}
                style={selesai || sedang ? { color: "#2563eb" } : undefined}
              >
                {langkah.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex sm:hidden flex-col gap-0">
        {LANGKAH.map((langkah, i) => {
          const selesai = i < aktif;
          const sedang = i === aktif;

          return (
            <div key={langkah.kode} className="flex items-stretch gap-3">
              {/* Kolom kiri: lingkaran + garis */}
              <div className="flex flex-col items-center">
                <div
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                    selesai
                      ? "text-white"
                      : sedang
                      ? "text-white"
                      : "bg-slate-200 text-slate-500",
                  ].join(" ")}
                  style={
                    selesai
                      ? { backgroundColor: "#2563eb" }
                      : sedang
                      ? {
                          backgroundColor: "#2563eb",
                          boxShadow: "0 0 0 4px rgba(37,99,235,0.2)",
                        }
                      : undefined
                  }
                  aria-label={`${langkah.label}: ${selesai ? "selesai" : sedang ? "sedang berlangsung" : "belum"}`}
                >
                  {selesai ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : sedang ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white block" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 block" />
                  )}
                </div>
                {/* Garis vertikal ke bawah (kecuali langkah terakhir) */}
                {i < LANGKAH.length - 1 && (
                  <div
                    className="w-0.5 flex-1 my-0.5"
                    style={{
                      backgroundColor:
                        i < aktif ? "#2563eb" : "#e2e8f0",
                      minHeight: "16px",
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Label */}
              <div className="flex items-center pb-4">
                <span
                  className={[
                    "text-xs font-semibold",
                    selesai || sedang ? "" : "text-slate-400",
                  ].join(" ")}
                  style={selesai || sedang ? { color: "#2563eb" } : undefined}
                >
                  {langkah.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
