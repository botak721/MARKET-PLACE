import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export default async function FotoHero() {
  await connection();

  const produk = await prisma.product.findMany({
    where: { gambar: { not: null }, stok: { gt: 0 } },
    orderBy: { id: "desc" },
    take: 4,
    select: { id: true, nama: true, gambar: true },
  });

  const foto = produk.flatMap((p) =>
    p.gambar ? [{ id: p.id, nama: p.nama, gambar: p.gambar }] : [],
  );
  if (foto.length < 2) return null;
  const tampil = foto.length >= 4 ? foto.slice(0, 4) : foto.slice(0, 2);

  return (
    <div className="hidden grid-cols-2 gap-3 pb-6 md:grid">
      {tampil.map((p, i) => (
        <Link
          key={p.id}
          href={`/produk/${p.id}`}
          className={`block overflow-hidden rounded-3xl ${i % 2 === 1 ? "translate-y-6" : ""}`}
        >
          <img
            src={p.gambar}
            alt={p.nama}
            className="aspect-square w-full object-cover"
          />
        </Link>
      ))}
    </div>
  );
}