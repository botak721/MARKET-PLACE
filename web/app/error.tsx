"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorHalaman({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-5 px-4 text-center sm:px-6">
      <p className="font-judul text-xl font-bold text-biru">Rizki Online Shop</p>
      <h1 className="font-judul text-3xl font-extrabold tracking-tight sm:text-4xl">
        Ada yang tidak beres
      </h1>
      <p className="text-slate-600">
        Halaman ini gagal dimuat. Data dan pesananmu tidak hilang. Coba muat ulang
        sebentar lagi, dan kalau masih sama, kembali ke beranda.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-full bg-biru px-6 font-semibold text-white shadow-md shadow-biru/20 transition-colors hover:bg-biru-tua"
        >
          Muat ulang halaman
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-slate-300 bg-white px-6 font-semibold transition-colors hover:bg-slate-50"
        >
          Kembali ke beranda
        </Link>
      </div>
    </main>
  );
}
