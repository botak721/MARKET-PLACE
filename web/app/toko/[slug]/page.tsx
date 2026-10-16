import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";

async function Etalase({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connection();

  const toko = await prisma.store.findUnique({
    where: { slug },
    include: { products: { orderBy: { id: "desc" } } },
  });
  if (!toko) notFound();

  const rating = await ambilRating(toko.products.map((p) => p.id));

  return (
    <>
      <section className="px-[5vw] pt-12 pb-6">
        <h1 className="font-judul text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] font-bold">
          {toko.nama}
        </h1>
        <p className="mt-3">{toko.products.length} produk</p>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-[5vw] pt-6 pb-16">
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
      </section>
    </>
  );
}

export default function TokoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px]">
        <Suspense fallback={<p className="px-[5vw] py-6">Memuat toko...</p>}>
          <Etalase params={params} />
        </Suspense>
      </main>
    </>
  );
}
