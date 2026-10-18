import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";
import { adaKategori } from "@/lib/kategori";
import ProductCard from "@/components/ProductCard";
import GridProduk from "@/components/GridProduk";

export default async function ProductList({ kategori }: { kategori?: string }) {
  await connection();
  const produk = await prisma.product.findMany({
    where: adaKategori(kategori) ? { kategori } : undefined,
    include: { store: true },
    orderBy: { id: "asc" },
  });
  const rating = await ambilRating(produk.map((p) => p.id));

  if (produk.length === 0) {
    return <p className="px-[5vw] py-8">Belum ada produk di kategori ini.</p>;
  }

  return (
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
  );
}