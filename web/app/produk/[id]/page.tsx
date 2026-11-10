import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import GridProduk from "@/components/GridProduk";
import PembelianProduk from "@/components/PembelianProduk";
import Bintang from "@/components/Bintang";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";
import { namaKategori } from "@/lib/kategori";
import { warnaDari } from "@/lib/warna";

const tanggal = (d: Date) =>
  d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const desimal = (n: number) =>
  n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection();

  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1 || productId > 2147483647) {
    notFound();
  }

  const produk = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      store: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { id: "desc" },
        take: 20,
      },
    },
  });
  if (!produk) notFound();

  const [rating, sebaran, ulasanToko, lain] = await Promise.all([
    ambilRating([produk.id]),
    prisma.review.groupBy({
      by: ["bintang"],
      where: { productId: produk.id },
      _count: { _all: true },
    }),
    prisma.review.aggregate({
      where: { product: { storeId: produk.storeId } },
      _avg: { bintang: true },
      _count: { _all: true },
    }),
    prisma.product.findMany({
      where: { storeId: produk.storeId, NOT: { id: produk.id } },
      orderBy: { id: "desc" },
      take: 4,
      include: { store: true },
    }),
  ]);
  const ratingLain = await ambilRating(lain.map((p) => p.id));

  const r = rating.get(produk.id);
  const hitung: Record<number, number> = {};
  for (const s of sebaran) hitung[s.bintang] = s._count._all;
  const totalUlasan = r?.jumlah ?? 0;

  const warna = warnaDari(produk.store.nama);
  const hurufToko = (Array.from(produk.store.nama.trim())[0] ?? "?").toUpperCase();
  const hurufProduk = (Array.from(produk.nama.trim())[0] ?? "?").toUpperCase();
  const kategoriNama = namaKategori(produk.kategori);
  const habis = produk.stok === 0;

  const pil =
    "inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-biru-tua";

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6">
      <nav
        aria-label="Jejak halaman"
        className="flex flex-wrap items-center gap-x-1 py-2 text-sm text-slate-600"
      >
        <Link href="/" className="inline-flex min-h-11 items-center hover:text-biru">
          Beranda
        </Link>
        {kategoriNama && (
          <>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            <Link
              href={`/?kategori=${produk.kategori}#produk`}
              className="inline-flex min-h-11 items-center hover:text-biru"
            >
              {kategoriNama}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        <Link
          href={`/toko/${produk.store.slug}`}
          className="inline-flex min-h-11 items-center hover:text-biru"
        >
          {produk.store.nama}
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span
          aria-current="page"
          className="max-w-[26ch] truncate font-semibold text-tinta"
        >
          {produk.nama}
        </span>
      </nav>

      <div className="grid gap-8 pt-2 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-kartu">
            {produk.gambar ? (
              <img
                src={produk.gambar}
                alt={produk.nama}
                className={`h-full w-full object-cover ${habis ? "opacity-60" : ""}`}
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center"
                style={{ backgroundColor: warna.bg, color: warna.teks }}
              >
                <span className="font-judul text-8xl font-bold opacity-80">
                  {hurufProduk}
                </span>
              </div>
            )}
            {habis && (
              <span className="absolute top-4 left-4 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                Stok habis
              </span>
            )}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-7">
          <div>
            <div className="flex flex-wrap gap-2">
              {kategoriNama && <span className={pil}>{kategoriNama}</span>}
            </div>
            <h1 className="font-judul mt-3 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-bold">
              {produk.nama}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {r ? (
                <>
                  <Bintang nilai={r.rata} />
                  <span className="font-bold">{desimal(r.rata)}</span>
                  <a href="#ulasan" className="text-slate-600 underline">
                    {r.jumlah} ulasan
                  </a>
                </>
              ) : (
                <span className="text-slate-600">Belum ada ulasan</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-bold tracking-wider text-biru-tua uppercase">
              Harga
            </p>
            <p className="font-judul mt-1 text-4xl font-extrabold text-biru tabular-nums">
              Rp{produk.harga.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: warna.bg, color: warna.teks }}
              >
                <span className="font-judul text-xl font-bold">{hurufToko}</span>
              </div>
              <div className="min-w-0">
                <p className="font-judul truncate text-lg font-bold">
                  {produk.store.nama}
                </p>
                <p className="text-sm text-slate-600">
                  {ulasanToko._count._all > 0 && ulasanToko._avg.bintang
                    ? `Rating toko ${desimal(ulasanToko._avg.bintang)} dari ${ulasanToko._count._all} ulasan`
                    : "Belum ada ulasan toko"}
                </p>
              </div>
            </div>
            <Link
              href={`/toko/${produk.store.slug}`}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-slate-100 px-5 text-sm font-semibold transition-colors hover:bg-slate-200"
            >
              Kunjungi toko
            </Link>
          </div>

          <PembelianProduk
            productId={produk.id}
            harga={produk.harga}
            stok={produk.stok}
          />
        </div>
      </div>

      <section aria-labelledby="judul-deskripsi" className="mt-12">
        <h2 id="judul-deskripsi" className="font-judul text-2xl font-bold">
          Deskripsi produk
        </h2>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-kartu">
          {produk.deskripsi ? (
            <p className="leading-relaxed whitespace-pre-line text-slate-700">
              {produk.deskripsi}
            </p>
          ) : (
            <p className="text-slate-600">
              Penjual belum menulis deskripsi untuk produk ini.
            </p>
          )}
        </div>
      </section>

      <section id="ulasan" aria-labelledby="judul-ulasan" className="mt-12 scroll-mt-24">
        <h2 id="judul-ulasan" className="font-judul text-2xl font-bold">
          Ulasan pembeli
        </h2>

        {r ? (
          <>
            <div className="mt-4 grid gap-6 rounded-2xl border border-blue-100 bg-blue-50 p-6 md:grid-cols-[14rem_1fr]">
              <div>
                <p className="font-judul text-5xl font-extrabold">
                  {desimal(r.rata)}
                  <span className="text-xl font-semibold text-slate-600"> / 5</span>
                </p>
                <div className="mt-2">
                  <Bintang nilai={r.rata} ukuran="h-5 w-5" />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Dari {totalUlasan} ulasan pembeli
                </p>
              </div>
              <ul className="space-y-2" aria-label="Sebaran bintang">
                {[5, 4, 3, 2, 1].map((n) => {
                  const jumlah = hitung[n] ?? 0;
                  const persen = totalUlasan > 0 ? (jumlah / totalUlasan) * 100 : 0;
                  return (
                    <li key={n} className="flex items-center gap-3 text-sm">
                      <span className="w-12 shrink-0 tabular-nums">{n} bintang</span>
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white">
                        <span
                          className="block h-full rounded-full bg-biru"
                          style={{ width: `${persen}%` }}
                        />
                      </span>
                      <span className="w-8 shrink-0 text-right tabular-nums text-slate-600">
                        {jumlah}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {produk.reviews.map((rv) => {
                const nama = rv.user.name.split(" ")[0];
                return (
                  <li
                    key={rv.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-kartu"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-biru-tua"
                        >
                          {(Array.from(nama)[0] ?? "?").toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold">{nama}</p>
                          <p className="text-xs text-slate-600">
                            Pembeli terverifikasi
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 text-xs text-slate-600">
                        {tanggal(rv.createdAt)}
                      </p>
                    </div>
                    <div className="mt-3">
                      <Bintang nilai={rv.bintang} />
                    </div>
                    {rv.komentar && (
                      <p className="mt-2 text-slate-700">{rv.komentar}</p>
                    )}
                  </li>
                );
              })}
            </ul>
            {totalUlasan > produk.reviews.length && (
              <p className="mt-4 text-sm text-slate-600">
                Menampilkan {produk.reviews.length} ulasan terbaru dari{" "}
                {totalUlasan} ulasan.
              </p>
            )}
          </>
        ) : (
          <p className="mt-4 text-slate-600">
            Belum ada ulasan untuk produk ini.
          </p>
        )}

        <p className="mt-4 text-sm text-slate-600">
          Sudah membeli produk ini? Tulis ulasanmu dari halaman{" "}
          <Link href="/pesanan" className="font-semibold text-biru underline">
            Pesananku
          </Link>{" "}
          setelah pesanan selesai.
        </p>
      </section>

      {lain.length > 0 && (
        <section aria-labelledby="judul-lain" className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 id="judul-lain" className="font-judul text-2xl font-bold">
              Produk lain dari toko ini
            </h2>
            <Link
              href={`/toko/${produk.store.slug}`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-biru hover:underline"
            >
              Lihat semua produk toko
            </Link>
          </div>
          <GridProduk sempit empat>
            {lain.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                nama={p.nama}
                toko={p.store.nama}
                slug={p.store.slug}
                harga={p.harga}
                gambar={p.gambar}
                stok={p.stok}
                rata={ratingLain.get(p.id)?.rata}
                jumlahUlasan={ratingLain.get(p.id)?.jumlah}
              />
            ))}
          </GridProduk>
        </section>
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  await connection();

  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1 || productId > 2147483647) {
    return { title: "Produk tidak ditemukan" };
  }

  const p = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      nama: true,
      harga: true,
      gambar: true,
      deskripsi: true,
      store: { select: { nama: true } },
    },
  });
  if (!p) return { title: "Produk tidak ditemukan" };

  const ringkas = p.deskripsi
    ? p.deskripsi.replace(/\s+/g, " ").slice(0, 150)
    : `${p.nama} dari ${p.store.nama}.`;
  const deskripsi = `Rp${p.harga.toLocaleString("id-ID")}. ${ringkas}`;
  const judul = `${p.nama} dari ${p.store.nama}`;

  return {
    title: judul,
    description: deskripsi,
    openGraph: {
      title: judul,
      description: deskripsi,
      siteName: "Rizki Online Shop",
      locale: "id_ID",
      images: p.gambar ? [p.gambar] : undefined,
    },
    twitter: {
      card: p.gambar ? "summary_large_image" : "summary",
      title: judul,
      description: deskripsi,
      images: p.gambar ? [p.gambar] : undefined,
    },
  };
}

export default function ProdukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<p className="px-4 py-12 sm:px-6">Memuat produk...</p>}>
          <Detail params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
