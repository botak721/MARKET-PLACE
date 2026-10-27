import { prisma } from "@/lib/prisma";
import type { NilaiFilter } from "@/lib/daftar-produk";

export async function idDenganRating(minimal: number) {
  if (minimal <= 0) return undefined;
  const hasil = await prisma.review.groupBy({
    by: ["productId"],
    _avg: { bintang: true },
    having: { bintang: { _avg: { gte: minimal } } },
  });
  return hasil.map((h) => h.productId);
}

export function susunWhere(
  f: NilaiFilter,
  idRating?: number[],
  abaikanKategori = false,
) {
  const harga = {
    ...(f.min !== undefined && { gte: f.min }),
    ...(f.maks !== undefined && { lte: f.maks }),
  };
  return {
    ...(!abaikanKategori &&
      f.kategori.length > 0 && { kategori: { in: f.kategori } }),
    ...(Object.keys(harga).length > 0 && { harga }),
    ...(f.tersedia && { stok: { gt: 0 } }),
    ...(idRating && { id: { in: idRating } }),
  };
}