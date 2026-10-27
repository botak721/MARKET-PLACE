import Link from "next/link";
import { connection } from "next/server";
import { X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";
import { namaKategori } from "@/lib/kategori";
import {
  PER_HALAMAN,
  aturUrutan,
  bacaFilter,
  bacaHalaman,
  bacaUrutan,
  buatUrl,
  paramFilter,
  satu,
  type NilaiFilter,
  type ParamMentah,
} from "@/lib/daftar-produk";
import { idDenganRating, susunWhere } from "@/lib/filter-produk";
import ProductCard from "@/components/ProductCard";
import GridProduk from "@/components/GridProduk";
import PilihUrutan from "@/components/PilihUrutan";
import Paginasi from "@/components/Paginasi";
import FormFilter from "@/components/FormFilter";
import PanelFilter from "@/components/PanelFilter";

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default async function DaftarProduk({
  dasar,
  param,
  kata,
  hash = "",
}: {
  dasar: string;
  param: ParamMentah;
  kata?: string;
  hash?: string;
}) {
  await connection();

  const f = bacaFilter(param);
  const urut = bacaUrutan(satu(param.urut));
  const idRating = await idDenganRating(f.rating);

  const cari = kata
    ? {
        OR: [
          { nama: { contains: kata, mode: "insensitive" as const } },
          { store: { nama: { contains: kata, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const where = { ...cari, ...susunWhere(f, idRating) };
  const whereTanpaKategori = { ...cari, ...susunWhere(f, idRating, true) };

  const total = await prisma.product.count({ where });
  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));
  const aktif = Math.min(bacaHalaman(satu(param.hal)), totalHalaman);

  const [produk, hitung] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { store: true },
      orderBy: aturUrutan(urut),
      skip: (aktif - 1) * PER_HALAMAN,
      take: PER_HALAMAN,
    }),
    prisma.product.groupBy({
      by: ["kategori"],
      where: whereTanpaKategori,
      _count: { _all: true },
    }),
  ]);
  const rating = await ambilRating(produk.map((p) => p.id));

  const jumlahKategori: Record<string, number> = {};
  for (const h of hitung) {
    if (h.kategori) jumlahKategori[h.kategori] = h._count._all;
  }

  const dasarParam = { q: kata, urut: urut === "terbaru" ? undefined : urut };
  const tanpa = (ubah: Partial<NilaiFilter>) =>
    buatUrl(dasar, { ...dasarParam, ...paramFilter({ ...f, ...ubah }) }, hash);
  const hapusSemua = buatUrl(dasar, dasarParam, hash);

  const chips: { label: string; href: string }[] = [];
  for (const k of f.kategori) {
    chips.push({
      label: namaKategori(k) ?? k,
      href: tanpa({ kategori: f.kategori.filter((x) => x !== k) }),
    });
  }
  if (f.min !== undefined || f.maks !== undefined) {
    const label =
      f.min !== undefined && f.maks !== undefined
        ? `${rupiah(f.min)} sampai ${rupiah(f.maks)}`
        : f.min !== undefined
          ? `Mulai ${rupiah(f.min)}`
          : `Sampai ${rupiah(f.maks ?? 0)}`;
    chips.push({ label, href: tanpa({ min: undefined, maks: undefined }) });
  }
  if (f.tersedia) {
    chips.push({ label: "Hanya yang tersedia", href: tanpa({ tersedia: false }) });
  }
  if (f.rating > 0) {
    chips.push({ label: `Rating ${f.rating} ke atas`, href: tanpa({ rating: 0 }) });
  }

  const formProps = {
    aksi: `${dasar}${hash}`,
    f,
    jumlahKategori,
    tersembunyi: dasarParam,
    hapusHref: hapusSemua,
  };

  return (
    <div className="grid gap-6 px-[5vw] pt-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <aside aria-label="Filter" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <p className="font-judul mb-3 text-lg font-bold">Filter</p>
        <FormFilter prefix="d" {...formProps} />
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PanelFilter jumlahAktif={chips.length}>
              <FormFilter prefix="m" {...formProps} />
            </PanelFilter>
            <p className="text-sm opacity-70">{total} produk</p>
          </div>
          <PilihUrutan
            aktif={urut}
            dasar={dasar}
            param={{ q: kata, ...paramFilter(f) }}
            hash={hash}
          />
        </div>

        {chips.length > 0 && (
          <ul aria-label="Filter aktif" className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <li key={c.label}>
                <Link
                  href={c.href}
                  aria-label={`Hapus filter ${c.label}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e3ecdf] pr-3 pl-4 text-sm text-hijau"
                >
                  {c.label}
                  <X className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={hapusSemua}
                className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-hijau underline"
              >
                Hapus semua
              </Link>
            </li>
          </ul>
        )}

        <div className="mt-5">
          {produk.length === 0 ? (
            <div className="py-12 text-center">
              <p>
                {kata
                  ? "Belum ada yang cocok. Coba kata lain atau longgarkan filter."
                  : "Tidak ada produk yang cocok dengan filter ini."}
              </p>
              {chips.length > 0 && (
                <Link
                  href={hapusSemua}
                  className="mt-4 inline-flex min-h-11 items-center rounded-full border-2 border-hijau px-5 font-semibold text-hijau"
                >
                  Hapus semua filter
                </Link>
              )}
            </div>
          ) : (
            <GridProduk sempit>
              {produk.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  nama={p.nama}
                  toko={p.store.nama}
                  slug={p.store.slug}
                  harga={p.harga}
                  gambar={p.gambar}
                  stok={p.stok}
                  rata={rating.get(p.id)?.rata}
                  jumlahUlasan={rating.get(p.id)?.jumlah}
                />
              ))}
            </GridProduk>
          )}
        </div>

        <Paginasi
          sempit
          halaman={aktif}
          totalHalaman={totalHalaman}
          dasar={dasar}
          param={{ ...dasarParam, ...paramFilter(f) }}
          hash={hash}
        />
      </div>
    </div>
  );
}