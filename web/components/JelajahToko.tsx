import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { warnaDari } from "@/lib/warna";

export default async function JelajahToko() {
  await connection();

  const toko = await prisma.store.findMany({
    where: { products: { some: {} } },
    select: {
      id: true,
      nama: true,
      slug: true,
      _count: { select: { products: true } },
    },
    orderBy: [{ products: { _count: "desc" } }, { id: "asc" }],
    take: 10,
  });
  if (toko.length < 2) return null;

  return (
    <section aria-labelledby="judul-toko" className="px-[5vw] pt-6">
      <h2 id="judul-toko" className="font-judul text-2xl font-bold">
        Jelajahi toko
      </h2>
      <ul className="scrollbar-hide mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
        {toko.map((t) => {
          const warna = warnaDari(t.nama);
          const huruf = (Array.from(t.nama.trim())[0] ?? "?").toUpperCase();
          return (
            <li key={t.id} className="shrink-0 snap-start">
              <Link
                href={`/toko/${t.slug}`}
                className="flex min-h-14 items-center gap-3 rounded-full bg-kartu py-2 pr-5 pl-2 ring-1 ring-hijau/15 transition-shadow hover:ring-hijau"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold"
                  style={{ backgroundColor: warna.bg, color: warna.teks }}
                >
                  {huruf}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t.nama}</span>
                  <span className="block text-xs opacity-70">
                    {t._count.products} produk
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}