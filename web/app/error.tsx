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
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-judul text-3xl font-bold text-hijau">
        Ada yang tidak beres
      </h1>
      <p>
        Halaman ini gagal dimuat. Coba lagi sebentar, dan kalau masih sama,
        kembali ke halaman utama.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="min-h-11 rounded-full bg-hijau px-6 font-semibold text-krem"
        >
          Coba lagi
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-hijau px-6 font-semibold text-hijau"
        >
          Ke halaman utama
        </Link>
      </div>
    </main>
  );
}