import { Suspense } from "react";
import { connection } from "next/server";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";
import {
  PER_HALAMAN,
  aturUrutan,
  bacaHalaman,
  bacaUrutan,
} from "@/lib/daftar-produk";
import GridProduk from "@/components/GridProduk";
import PilihUrutan from "@/components/PilihUrutan";
import Paginasi from "@/components/Paginasi";
import Footer from "@/components/Footer";

type Param = { q?: string; urut?: string; hal?: string };

async function Hasil({ searchParams }: { searchParams: Promise<Param> }) {
  const { q, urut: urutMasuk, hal } = await searchParams;
  const kata = (q ?? "").trim();
  const urut = bacaUrutan(urutMasuk);
  await connection();

  if (!kata) {
    return (
      <p className="px-[5vw] py-12">Ketik nama barang atau toko yang dicari.</p>
    );
  }

  const where = {
    OR: [
      { nama: { contains: kata, mode: "insensitive" as const } },
      { store: { nama: { contains: kata, mode: "insensitive" as const } } },
    ],
  };

  const total = await prisma.product.count({ where });
  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));
  const aktif = Math.min(bacaHalaman(hal), totalHalaman);

  const produk = await prisma.product.findMany({
    where,
    include: { store: true },
    orderBy: aturUrutan(urut),
    skip: (aktif - 1) * PER_HALAMAN,
    take: PER_HALAMAN,
  });
  const rating = await ambilRating(produk.map((p) => p.id));

  return (
    <>
      <section className="px-[5vw] pt-12 pb-6">
        <h1 className="font-judul text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold">
          {`Hasil untuk "${kata}"`}
        </h1>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p>{total} produk ditemukan</p>
          {total > 0 && (
            <PilihUrutan aktif={urut} dasar="/cari" param={{ q: kata }} />
          )}
        </div>
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
              rata={rating.get(p.id)?.rata}
              jumlahUlasan={rating.get(p.id)?.jumlah}
            />
          ))}
        </GridProduk>
      )}

      <Paginasi
        halaman={aktif}
        totalHalaman={totalHalaman}
        dasar="/cari"
        param={{ q: kata, urut: urut === "terbaru" ? undefined : urut }}
      />
    </>
  );
}

export default function CariPage({
  searchParams,
}: {
  searchParams: Promise<Param>;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px]">
        <Suspense fallback={<p className="px-[5vw] py-12">Mencari...</p>}>
          <Hasil searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}