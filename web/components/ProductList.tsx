import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function ProductList() {
  await connection();
  const produk = await prisma.product.findMany({
    include: { store: true },
    orderBy: { id: "asc" },
  });

  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 px-[5vw] pt-6 pb-16">
      {produk.map((p) => (
        <ProductCard key={p.id} id={p.id} nama={p.nama} toko={p.store.nama} slug={p.store.slug} harga={p.harga} />
      ))}
    </section>
  );
}