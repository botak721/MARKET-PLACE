import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export default async function Statistik() {
  await connection();
  const [produk, toko] = await Promise.all([
    prisma.product.count(),
    prisma.store.count(),
  ]);
  return (
    <p className="mt-6 text-sm opacity-70">
      {produk} produk dari {toko} toko
    </p>
  );
}