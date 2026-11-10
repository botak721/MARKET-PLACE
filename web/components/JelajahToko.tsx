import Link from "next/link";
import { connection } from "next/server";
import { Star, Store } from "lucide-react";
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
      products: { select: { reviews: { select: { bintang: true } } } },
    },
    orderBy: [{ products: { _count: "desc" } }, { id: "asc" }],
    take: 6,
  });
  if (toko.length < 2) return null;

  return (
    <section aria-labelledby="judul-toko" className="px-4 pt-12 sm:px-6">
      <div className="mb-6">
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-biru uppercase">
          <Store className="h-4 w-4" aria-hidden="true" />
          Toko
        </p>
        <h2 id="judul-toko" className="font-judul text-2xl font-bold sm:text-3xl">
          Jelajahi toko
        </h2>
        <p className="mt-1 text-slate-600">
          Beli langsung dari penjualnya. Setiap toko punya etalase sendiri.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {toko.map((t) => {
          const warna = warnaDari(t.nama);
          const huruf = (Array.from(t.nama.trim())[0] ?? "?").toUpperCase();
          const bintang = t.products.flatMap((p) =>
            p.reviews.map((r) => r.bintang),
          );
          const rata =
            bintang.length > 0
              ? bintang.reduce((a, b) => a + b, 0) / bintang.length
              : null;

          return (
            <li
              key={t.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-kartu transition-shadow hover:shadow-kartu-naik motion-reduce:transition-none"
            >
              <div className="mb-4 flex items-start gap-4">
                <div
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner"
                  style={{ backgroundColor: warna.bg, color: warna.teks }}
                >
                  <span className="font-judul text-2xl font-bold">{huruf}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-judul truncate text-lg font-bold">
                    {t.nama}
                  </h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-600">
                    <span>{t._count.products} produk</span>
                    {rata !== null && (
                      <span className="inline-flex items-center gap-1">
                        <Star
                          className="h-4 w-4 fill-biru text-biru"
                          aria-hidden="true"
                        />
                        {rata.toLocaleString("id-ID", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}{" "}
                        ({bintang.length} ulasan)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Link
                href={`/toko/${t.slug}`}
                className="flex min-h-11 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold transition-colors hover:bg-slate-200"
              >
                Kunjungi toko
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
