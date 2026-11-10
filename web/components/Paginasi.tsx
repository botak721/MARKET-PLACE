import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buatUrl } from "@/lib/daftar-produk";

function daftarHalaman(h: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pilih = new Set(
    [1, total, h - 1, h, h + 1].filter((n) => n >= 1 && n <= total),
  );
  const urut = [...pilih].sort((a, b) => a - b);

  const hasil: (number | "...")[] = [];
  urut.forEach((n, i) => {
    if (i > 0) {
      const selisih = n - urut[i - 1];
      if (selisih === 2) hasil.push(n - 1);
      else if (selisih > 2) hasil.push("...");
    }
    hasil.push(n);
  });
  return hasil;
}

const tombol =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold";

export default function Paginasi({
  halaman,
  totalHalaman,
  dasar,
  param,
  hash,
  sempit = false,
}: {
  halaman: number;
  totalHalaman: number;
  dasar: string;
  param: Record<string, string | undefined>;
  hash?: string;
  sempit?: boolean;
}) {
  if (totalHalaman <= 1) return null;

  const url = (h: number) =>
    buatUrl(dasar, { ...param, hal: h > 1 ? String(h) : undefined }, hash);

  return (
    <nav
      aria-label="Halaman"
      className={`flex items-center justify-between gap-2 sm:justify-center sm:gap-3 ${sempit ? "pt-2 pb-10" : "-mt-8 px-4 pb-16 sm:px-6"}`}
    >
      {halaman > 1 ? (
        <Link
          href={url(halaman - 1)}
          rel="prev"
          aria-label="Halaman sebelumnya"
          className={`${tombol} border-slate-300 bg-white text-tinta hover:bg-slate-50`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${tombol} border-slate-200 bg-white text-tinta opacity-40`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </span>
      )}

      <p className="text-sm sm:hidden">
        Halaman {halaman} dari {totalHalaman}
      </p>

      <ul className="hidden items-center gap-2 sm:flex">
        {daftarHalaman(halaman, totalHalaman).map((h, i) =>
          h === "..." ? (
            <li key={`titik-${i}`} aria-hidden="true" className="px-1 text-slate-500">
              ...
            </li>
          ) : (
            <li key={h}>
              {h === halaman ? (
                <span
                  aria-current="page"
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-biru px-3 text-sm font-bold text-white"
                >
                  {h}
                </span>
              ) : (
                <Link
                  href={url(h)}
                  aria-label={`Halaman ${h}`}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-tinta hover:bg-slate-50"
                >
                  {h}
                </Link>
              )}
            </li>
          ),
        )}
      </ul>

      {halaman < totalHalaman ? (
        <Link
          href={url(halaman + 1)}
          rel="next"
          aria-label="Halaman berikutnya"
          className={`${tombol} border-slate-300 bg-white text-tinta hover:bg-slate-50`}
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${tombol} border-slate-200 bg-white text-tinta opacity-40`}
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
