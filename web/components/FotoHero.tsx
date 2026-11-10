import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export default async function FotoHero() {
  await connection();

  const produk = await prisma.product.findMany({
    where: { gambar: { not: null }, stok: { gt: 0 } },
    orderBy: { id: "desc" },
    take: 4,
    include: { store: { select: { nama: true } } },
  });

  const foto = produk.flatMap((p) =>
    p.gambar
      ? [
          {
            id: p.id,
            nama: p.nama,
            harga: p.harga,
            toko: p.store.nama,
            gambar: p.gambar,
          },
        ]
      : [],
  );
  if (foto.length < 2) return null;
  const tampil = foto.length >= 4 ? foto.slice(0, 4) : foto.slice(0, 2);

  return (
    <div className="hidden grid-cols-2 gap-4 md:grid">
      {tampil.map((p, i) => (
        <Link
          key={p.id}
          href={`/produk/${p.id}`}
          className={`group block rounded-2xl bg-white p-3 text-tinta shadow-md transition-transform hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${i % 2 === 1 ? "mt-4" : ""}`}
        >
          <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-slate-100">
            <img
              src={p.gambar}
              alt={p.nama}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>
          <p className="truncate text-xs font-semibold text-slate-600">
            {p.toko}
          </p>
          <p className="line-clamp-1 font-bold">{p.nama}</p>
          <p className="font-judul mt-1 font-extrabold text-biru tabular-nums">
            Rp{p.harga.toLocaleString("id-ID")}
          </p>
        </Link>
      ))}
    </div>
  );
}
