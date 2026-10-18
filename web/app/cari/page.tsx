import { Suspense } from "react";
import { connection } from "next/server";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import GridProduk from "@/components/GridProduk";

async function Hasil({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const kata = (q ?? "").trim();
  await connection();

  if (!kata) {
    return (
      <p className="px-[5vw] py-12">Ketik nama barang atau toko yang dicari.</p>
    );
  }

  const produk = await prisma.product.findMany({
    where: {
      OR: [
        { nama: { contains: kata, mode: "insensitive" } },
        { store: { nama: { contains: kata, mode: "insensitive" } } },
      ],
    },
    include: { store: true },
    orderBy: { id: "desc" },
    take: 48,
  });

  return (
    <>
      <section className="px-[5vw] pt-12 pb-6">
        <h1 className="font-judul text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold">
          {`Hasil untuk "${kata}"`}
        </h1>
        <p className="mt-3">{produk.length} produk ditemukan</p>
      </section>

      {produk.length === 0 ? (
        <p className="px-[5vw] pb-16">Belum ada yang cocok. Coba kata lain.</p>
      ) : (
        <GridProduk>
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
            />
          ))}
        </GridProduk>
      )}
    </>
  );
}

export default function CariPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px]">
        <Suspense fallback={<p className="px-[5vw] py-12">Mencari...</p>}>
          <Hasil searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}