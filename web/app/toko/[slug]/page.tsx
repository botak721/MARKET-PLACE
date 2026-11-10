import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CalendarDays, ChevronRight, Package, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import GridProduk from "@/components/GridProduk";
import PilihUrutan from "@/components/PilihUrutan";
import Paginasi from "@/components/Paginasi";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";
import { adaKategori, namaKategori } from "@/lib/kategori";
import { warnaDari } from "@/lib/warna";
import {
  PER_HALAMAN,
  aturUrutan,
  bacaHalaman,
  bacaUrutan,
  buatUrl,
  satu,
  type ParamMentah,
} from "@/lib/daftar-produk";

async function Etalase({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ParamMentah>;
}) {
  const { slug } = await params;
  const param = await searchParams;
  await connection();

  const toko = await prisma.store.findUnique({
    where: { slug },
    select: { id: true, nama: true, slug: true, createdAt: true },
  });
  if (!toko) notFound();

  const kat = satu(param.kategori);
  const kategori = adaKategori(kat) ? kat : undefined;
  const urut = bacaUrutan(satu(param.urut));
  const dasar = `/toko/${toko.slug}`;

  const where = { storeId: toko.id, ...(kategori ? { kategori } : {}) };
  const total = await prisma.product.count({ where });
  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));
  const aktif = Math.min(bacaHalaman(satu(param.hal)), totalHalaman);

  const [produk, jumlahProduk, ulasan, selesai, perKategori] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: aturUrutan(urut),
        skip: (aktif - 1) * PER_HALAMAN,
        take: PER_HALAMAN,
      }),
      prisma.product.count({ where: { storeId: toko.id } }),
      prisma.review.aggregate({
        where: { product: { storeId: toko.id } },
        _avg: { bintang: true },
        _count: { _all: true },
      }),
      prisma.order.count({ where: { storeId: toko.id, status: "SELESAI" } }),
      prisma.product.groupBy({
        by: ["kategori"],
        where: { storeId: toko.id },
        _count: { _all: true },
      }),
    ]);
  const rating = await ambilRating(produk.map((p) => p.id));

  const warna = warnaDari(toko.nama);
  const huruf = (Array.from(toko.nama.trim())[0] ?? "?").toUpperCase();
  const sejak = toko.createdAt.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const rata = ulasan._avg.bintang;
  const desimal = (n: number) =>
    n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const chips = perKategori
    .flatMap((k) =>
      k.kategori && adaKategori(k.kategori)
        ? [{ slug: k.kategori, nama: namaKategori(k.kategori) ?? k.kategori, n: k._count._all }]
        : [],
    )
    .sort((a, b) => b.n - a.n);

  const dasarParam = { urut: urut === "terbaru" ? undefined : urut };
  const chip =
    "inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold whitespace-nowrap transition-colors";

  const statistik = [
    { label: "Produk aktif", nilai: jumlahProduk.toLocaleString("id-ID") },
    { label: "Pesanan selesai", nilai: selesai.toLocaleString("id-ID") },
    { label: "Ulasan pembeli", nilai: ulasan._count._all.toLocaleString("id-ID") },
    { label: "Rating rata-rata", nilai: rata ? desimal(rata) : "Belum ada" },
  ];

  return (
    <>
      <div className="border-b border-slate-200 bg-white">
        <nav
          aria-label="Jejak halaman"
          className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-1 px-4 text-sm text-slate-600 sm:px-6"
        >
          <Link href="/" className="inline-flex min-h-11 items-center hover:text-biru">
            Beranda
          </Link>
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span aria-current="page" className="font-semibold text-tinta">
            {toko.nama}
          </span>
        </nav>
      </div>

      <section className="relative overflow-hidden bg-navy text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-biru/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-[1200px] px-4 py-10 sm:px-6 md:py-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              aria-hidden="true"
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl shadow-lg sm:h-28 sm:w-28"
              style={{ backgroundColor: warna.bg, color: warna.teks }}
            >
              <span className="font-judul text-5xl font-extrabold sm:text-6xl">
                {huruf}
              </span>
            </div>
            <div>
              <h1 className="font-judul text-[clamp(1.75rem,5vw,2.75rem)] leading-tight font-extrabold tracking-tight">
                {toko.nama}
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Buka sejak {sejak}
                </span>
                {rata ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-white text-white" aria-hidden="true" />
                    {desimal(rata)} dari {ulasan._count._all} ulasan
                  </span>
                ) : (
                  <span>Belum ada ulasan</span>
                )}
              </p>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {statistik.map((s) => (
              <div
                key={s.label}
                className="flex flex-col-reverse rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <dt className="text-xs text-slate-300">{s.label}</dt>
                <dd className="font-judul text-2xl font-bold">{s.nilai}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 pt-6 sm:px-6">
        {jumlahProduk === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-kartu">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-biru">
              <Package className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 className="font-judul mt-5 text-xl font-bold">
              Belum ada produk di etalase ini
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Penjual belum menambahkan produk. Coba lihat toko lain sambil
              menunggu.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/#produk"
                className="inline-flex min-h-11 items-center rounded-full bg-biru px-6 font-semibold text-white transition-colors hover:bg-biru-tua"
              >
                Jelajahi produk lain
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-600">
              Pemilik toko ini? Tambahkan produk pertama dari{" "}
              <Link href="/dashboard" className="font-semibold text-biru underline">
                dashboard
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            {chips.length > 0 && (
              <nav
                aria-label="Kategori di toko ini"
                className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
              >
                <Link
                  href={buatUrl(dasar, dasarParam)}
                  aria-current={kategori ? undefined : "page"}
                  className={`${chip} ${kategori ? "border-slate-300 bg-white text-tinta hover:bg-slate-50" : "border-navy bg-navy text-white"}`}
                >
                  Semua ({jumlahProduk})
                </Link>
                {chips.map((k) => (
                  <Link
                    key={k.slug}
                    href={buatUrl(dasar, { ...dasarParam, kategori: k.slug })}
                    aria-current={kategori === k.slug ? "page" : undefined}
                    className={`${chip} ${kategori === k.slug ? "border-navy bg-navy text-white" : "border-slate-300 bg-white text-tinta hover:bg-slate-50"}`}
                  >
                    {k.nama} ({k.n})
                  </Link>
                ))}
              </nav>
            )}

            <div className="mt-5 mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-judul text-2xl font-bold">Katalog produk</h2>
              <PilihUrutan
                aktif={urut}
                dasar={dasar}
                param={{ kategori }}
              />
            </div>

            {produk.length === 0 ? (
              <div className="py-12 text-center">
                <p>Tidak ada produk di kategori ini.</p>
                <Link
                  href={buatUrl(dasar, dasarParam)}
                  className="mt-4 inline-flex min-h-11 items-center rounded-full border-[1.5px] border-navy px-5 font-semibold text-navy"
                >
                  Lihat semua produk
                </Link>
              </div>
            ) : (
              <GridProduk sempit empat>
                {produk.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    nama={p.nama}
                    toko={toko.nama}
                    slug={toko.slug}
                    harga={p.harga}
                    gambar={p.gambar}
                    stok={p.stok}
                    rata={rating.get(p.id)?.rata}
                    jumlahUlasan={rating.get(p.id)?.jumlah}
                  />
                ))}
              </GridProduk>
            )}

            <Paginasi
              sempit
              halaman={aktif}
              totalHalaman={totalHalaman}
              dasar={dasar}
              param={{ kategori, ...dasarParam }}
            />
          </>
        )}
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await connection();

  const toko = await prisma.store.findUnique({
    where: { slug },
    select: {
      nama: true,
      _count: { select: { products: true } },
      products: {
        where: { gambar: { not: null } },
        orderBy: { id: "desc" },
        take: 1,
        select: { gambar: true },
      },
    },
  });
  if (!toko) return { title: "Toko tidak ditemukan" };

  const deskripsi = `${toko._count.products} produk dari ${toko.nama}.`;
  const foto = toko.products[0]?.gambar ?? undefined;

  return {
    title: toko.nama,
    description: deskripsi,
    openGraph: {
      title: toko.nama,
      description: deskripsi,
      siteName: "Rizki Online Shop",
      locale: "id_ID",
      images: foto ? [foto] : undefined,
    },
  };
}

export default function TokoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ParamMentah>;
}) {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<p className="px-4 py-12 sm:px-6">Memuat toko...</p>}>
          <Etalase params={params} searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
