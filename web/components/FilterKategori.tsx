import Link from "next/link";
import { KATEGORI, adaKategori } from "@/lib/kategori";

export default function FilterKategori({ aktif }: { aktif?: string }) {
  const terpilih = adaKategori(aktif) ? aktif : null;
  const dasar =
    "whitespace-nowrap rounded-full border-2 border-hijau px-4 py-1.5 text-sm font-semibold";

  return (
    <nav aria-label="Kategori" className="flex gap-2 overflow-x-auto px-[5vw] pt-6 pb-1">
      <Link
        href="/#produk"
        className={`${dasar} ${terpilih ? "text-hijau" : "bg-hijau text-krem"}`}
      >
        Semua
      </Link>
      {KATEGORI.map((k) => (
        <Link
          key={k.slug}
          href={`/?kategori=${k.slug}#produk`}
          className={`${dasar} ${terpilih === k.slug ? "bg-hijau text-krem" : "text-hijau"}`}
        >
          {k.nama}
        </Link>
      ))}
    </nav>
  );
}