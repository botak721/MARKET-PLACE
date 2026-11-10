import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";
import CarouselPilihan, {
  type ItemPilihan,
} from "@/components/CarouselPilihan";

export default async function ProdukPilihan() {
  await connection();

  const produk = await prisma.product.findMany({
    where: { gambar: { not: null }, stok: { gt: 0 } },
    include: { store: { select: { nama: true, slug: true } } },
    orderBy: [{ reviews: { _count: "desc" } }, { id: "desc" }],
    take: 8,
  });
  if (produk.length < 3) return null;

  const rating = await ambilRating(produk.map((p) => p.id));

  const items: ItemPilihan[] = produk.flatMap((p, i) => {
    if (!p.gambar) return [];
    const r = rating.get(p.id);
    return [
      {
        id: p.id,
        nama: p.nama,
        toko: p.store.nama,
        slug: p.store.slug,
        harga: p.harga,
        gambar: p.gambar,
        stok: p.stok,
        rata: r?.rata,
        jumlahUlasan: r?.jumlah,
        lencana: i === 0 && r ? "Terpopuler" : undefined,
      },
    ];
  });

  return <CarouselPilihan items={items} />;
}
