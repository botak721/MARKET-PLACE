import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { ambilRating } from "@/lib/rating";
import GridProduk from "@/components/GridProduk";

export default async function ProductList() {
  await connection();
  const produk = await prisma.product.findMany({
    include: { store: true },
    orderBy: { id: "asc" },
  });

  const rating = await ambilRating(produk.map((p) => p.id));

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
