import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Header from "@/components/Header";
import TambahKeranjang from "@/components/TambahKeranjang";
import { prisma } from "@/lib/prisma";
import { ambilRating } from "@/lib/rating";

const tanggal = (d: Date) =>
  d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection();

  const productId = Number(id);
  if (!Number.isInteger(productId) || productId < 1 || productId > 2147483647) {
    notFound();
  }

  const produk = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      store: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { id: "desc" },
        take: 50,
      },
    },
  });
  if (!produk) notFound();

  const rating = (await ambilRating([produk.id])).get(produk.id);

  return (
    <section className="grid gap-8 px-[5vw] pt-10 pb-16 md:grid-cols-2">
      {produk.gambar ? (
        <img
          src={produk.gambar}
          alt={produk.nama}
          className="aspect-square w-full rounded-3xl object-cover"
        />
      ) : (
        <div className="aspect-square w-full rounded-3xl bg-[#d9cdb8]" />
      )}

      <div>
        <h1 className="font-judul text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-bold">
          {produk.nama}
        </h1>
        <Link
          href={`/toko/${produk.store.slug}`}
          className="mt-3 inline-block rounded-full bg-[#e3ecdf] px-2.5 py-0.5 text-sm text-hijau"
        >
          {produk.store.nama}
        </Link>
        <p className="mt-4 text-2xl font-semibold text-hijau">
          Rp{produk.harga.toLocaleString("id-ID")}
        </p>
        {rating && (
          <p className="mt-2 text-sm">
            <span className="text-[#d99a1e]">★</span>{" "}
            {rating.rata.toLocaleString("id-ID", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            <span className="opacity-60">({rating.jumlah} ulasan)</span>
          </p>
        )}
        <div className="mt-5">
          <TambahKeranjang productId={produk.id} />
        </div>
      </div>

      <div className="md:col-span-2">
        <h2 className="font-judul text-2xl font-bold text-hijau">
          Ulasan pembeli
        </h2>
        {produk.reviews.length === 0 && (
          <p className="mt-3 text-sm opacity-70">
            Belum ada ulasan untuk produk ini.
          </p>
        )}
        <div className="mt-4 space-y-3">
          {produk.reviews.map((r) => (
            <article key={r.id} className="rounded-2xl bg-kartu px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold">
                  {r.user.name.split(" ")[0]}
                </span>
                <span className="opacity-60">{tanggal(r.createdAt)}</span>
              </div>
              <p className="mt-1 text-[#d99a1e]">
                {"★".repeat(r.bintang)}
                <span className="opacity-30">{"★".repeat(5 - r.bintang)}</span>
              </p>
              {r.komentar && <p className="mt-1 text-sm">{r.komentar}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProdukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px]">
        <Suspense fallback={<p className="px-[5vw] py-12">Memuat produk...</p>}>
          <Detail params={params} />
        </Suspense>
      </main>
    </>
  );
}
