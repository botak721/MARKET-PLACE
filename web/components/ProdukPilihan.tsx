import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";
import { namaKategori } from "@/lib/kategori";
import CarouselPilihan, { type ItemPilihan } from "@/components/CarouselPilihan";

export default async function ProdukPilihan() {
  await connection();

  const produk = await prisma.product.findMany({
    where: { gambar: { not: null }, stok: { gt: 0 } },
    include: { store: { select: { nama: true } } },
    orderBy: [{ reviews: { _count: "desc" } }, { id: "desc" }],
    take: 8,
  });
  if (produk.length < 3) return null;

  const rating = await ambilRating(produk.map((p) => p.id));

  const items: ItemPilihan[] = produk.flatMap((p) => {
    if (!p.gambar) return [];
    const r = rating.get(p.id);
    const info = r
      ? `★ ${r.rata.toLocaleString("id-ID", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })} (${r.jumlah})`
      : p.stok <= 5
        ? `Sisa ${p.stok}`
        : null;
    return [
      {
        id: p.id,
        nama: p.nama,
        harga: p.harga,
        gambar: p.gambar,
        kategori: namaKategori(p.kategori),
        toko: p.store.nama,
        info,
      },
    ];
  });

  return (
    <section aria-labelledby="judul-pilihan" className="px-[5vw] pt-8">
      <h2 id="judul-pilihan" className="font-judul text-2xl font-bold">
        Produk pilihan
      </h2>
      <p className="mt-1 text-sm opacity-70">
        Yang paling banyak diulas dan masih tersedia.
      </p>
      <div className="mt-4">
        <CarouselPilihan items={items} />
      </div>
    </section>
  );
}