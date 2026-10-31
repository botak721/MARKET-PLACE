import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";
import { warnaDari } from "@/lib/warna";
import GridProduk from "@/components/GridProduk";
import Footer from "@/components/Footer";
import SkeletonGrid from "@/components/SkeletonGrid";

async function Etalase({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connection();

  const toko = await prisma.store.findUnique({
    where: { slug },
    include: { products: { orderBy: { id: "desc" } } },
  });
  if (!toko) notFound();

  const rating = await ambilRating(toko.products.map((p) => p.id));

  let jumlahUlasan = 0;
  let totalBintang = 0;
  for (const r of rating.values()) {
    jumlahUlasan += r.jumlah;
    totalBintang += r.rata * r.jumlah;
  }
  const rataToko = jumlahUlasan > 0 ? totalBintang / jumlahUlasan : null;

  const warna = warnaDari(toko.nama);
  const huruf = (Array.from(toko.nama.trim())[0] ?? "?").toUpperCase();
  const sejak = toko.createdAt.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <section style={{ backgroundColor: warna.bg, color: warna.teks }}>
        <div className="mx-auto flex max-w-[1200px] items-center gap-5 px-[5vw] py-8 sm:py-12">
          <span
            aria-hidden="true"
            className="font-judul flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-kartu text-4xl font-bold sm:h-24 sm:w-24 sm:text-5xl"
            style={{ color: warna.teks }}
          >
            {huruf}
          </span>
          <div>
            <h1 className="font-judul text-[clamp(1.75rem,5vw,3rem)] leading-[1.1] font-bold">
              {toko.nama}
            </h1>
            <p className="mt-2 text-sm sm:text-base">
              {toko.products.length} produk, buka sejak {sejak}
            </p>
            {rataToko !== null && (
              <p className="mt-1 text-sm sm:text-base">
                ★{" "}
                {rataToko.toLocaleString("id-ID", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                dari {jumlahUlasan} ulasan
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px]">
        {toko.products.length === 0 ? (
          <p className="px-[5vw] py-12">Toko ini belum punya produk.</p>
        ) : (
          <GridProduk>
            {toko.products.map((p) => (
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
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SkeletonGrid />}>
          <Etalase params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}