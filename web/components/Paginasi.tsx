import Link from "next/link";
import { buatUrl } from "@/lib/daftar-produk";

export default function Paginasi({
  halaman,
  totalHalaman,
  dasar,
  param,
  hash,
}: {
  halaman: number;
  totalHalaman: number;
  dasar: string;
  param: Record<string, string | undefined>;
  hash?: string;
}) {
  if (totalHalaman <= 1) return null;

  const tombol =
    "inline-flex min-h-11 items-center rounded-full border-2 border-hijau px-5 text-sm font-semibold";
  const url = (h: number) =>
    buatUrl(dasar, { ...param, hal: h > 1 ? String(h) : undefined }, hash);

  return (
    <nav
      aria-label="Halaman"
      className="-mt-8 flex items-center justify-between gap-3 px-[5vw] pb-16"
    >
      {halaman > 1 ? (
        <Link href={url(halaman - 1)} rel="prev" className={`${tombol} text-hijau`}>
          Sebelumnya
        </Link>
      ) : (
        <span aria-disabled="true" className={`${tombol} text-hijau opacity-30`}>
          Sebelumnya
        </span>
      )}
      <p className="text-sm">
        Halaman {halaman} dari {totalHalaman}
      </p>
      {halaman < totalHalaman ? (
        <Link href={url(halaman + 1)} rel="next" className={`${tombol} text-hijau`}>
          Berikutnya
        </Link>
      ) : (
        <span aria-disabled="true" className={`${tombol} text-hijau opacity-30`}>
          Berikutnya
        </span>
      )}
    </nav>
  );
}