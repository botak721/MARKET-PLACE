import { prisma } from "@/lib/prisma";

export async function ambilRating(productIds: number[]) {
  const peta = new Map<number, { rata: number; jumlah: number }>();
  if (productIds.length === 0) return peta;

  const hasil = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { bintang: true },
    _count: { _all: true },
  });

  for (const h of hasil) {
    peta.set(h.productId, {
      rata: h._avg.bintang ?? 0,
      jumlah: h._count._all,
    });
  }
  return peta;
}