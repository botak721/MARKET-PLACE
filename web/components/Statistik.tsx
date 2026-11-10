import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export default async function Statistik() {
  await connection();
  const [produk, toko, ulasan] = await Promise.all([
    prisma.product.count(),
    prisma.store.count(),
    prisma.review.count(),
  ]);

  const data = [
    { nilai: produk, label: "Produk" },
    { nilai: toko, label: "Toko" },
    { nilai: ulasan, label: "Ulasan pembeli" },
  ];

  return (
    <dl className="mt-2 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col-reverse">
          <dt className="text-xs text-slate-300">{d.label}</dt>
          <dd className="font-judul text-2xl font-bold">
            {d.nilai.toLocaleString("id-ID")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
