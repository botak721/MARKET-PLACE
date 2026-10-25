import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";
import { adaKategori } from "@/lib/kategori";
import { PER_HALAMAN, aturUrutan, type KodeUrutan } from "@/lib/daftar-produk";
import ProductCard from "@/components/ProductCard";
import GridProduk from "@/components/GridProduk";
import PilihUrutan from "@/components/PilihUrutan";
import Paginasi from "@/components/Paginasi";

export default async function ProductList({
  kategori,
  urut,
  halaman,
}: {
  kategori?: string;
  urut: KodeUrutan;
  halaman: number;
}) {
  await connection();

  const where = adaKategori(kategori) ? { kategori } : undefined;
  const total = await prisma.product.count({ where });
  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));
  const aktif = Math.min(halaman, totalHalaman);

  const produk = await prisma.product.findMany({
    where,
    include: { store: true },
    orderBy: aturUrutan(urut),
    skip: (aktif - 1) * PER_HALAMAN,
    take: PER_HALAMAN,
  });
  const rating = await ambilRating(produk.map((p) => p.id));

  const param = { kategori: adaKategori(kategori) ? kategori : undefined };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 px-[5vw] pt-5">
        <p className="text-sm opacity-70">{total} produk</p>
        <PilihUrutan aktif={urut} dasar="/" param={param} hash="#produk" />
      </div>

      {produk.length === 0 ? (
        <p className="px-[5vw] py-8">Belum ada produk di kategori ini.</p>
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
        dasar="/"
        param={{ ...param, urut: urut === "terbaru" ? undefined : urut }}
        hash="#produk"
      />
    </>
  );
}