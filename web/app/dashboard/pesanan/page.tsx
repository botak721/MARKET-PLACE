"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ambilPesananToko, majukanStatus } from "@/app/pesanan/actions";
import { infoStatus } from "@/lib/status";

type Pesanan = Awaited<ReturnType<typeof ambilPesananToko>>[number];

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const LABEL_TOMBOL: Record<string, string> = {
  MENUNGGU: "Proses pesanan",
  DIPROSES: "Tandai dikirim",
};

export default function PesananMasukPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [pesanan, setPesanan] = useState<Pesanan[] | undefined>(undefined);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/sign-in");
  }, [isPending, session, router]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) ambilPesananToko().then(setPesanan);
  }, [userId]);

  async function majukan(id: number) {
    await majukanStatus(id);
    setPesanan(await ambilPesananToko());
  }

  if (isPending || pesanan === undefined) {
    return <p className="mt-8 text-center">Memuat pesanan...</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/dashboard"
        className="text-sm font-semibold text-hijau underline"
      >
        Kembali ke dashboard
      </Link>
      <h1 className="font-judul mt-3 text-3xl font-bold text-hijau">
        Pesanan masuk
      </h1>

      {pesanan.length === 0 && <p className="mt-6">Belum ada pesanan masuk.</p>}

      <div className="mt-6 space-y-4">
        {pesanan.map((o) => (
          <section key={o.id} className="rounded-3xl bg-kartu p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">
                #{o.id} dari {o.pembeli}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-sm ${infoStatus(o.status).kelas}`}
              >
                {infoStatus(o.status).label}
              </span>
            </div>
            <p className="mt-1 text-sm opacity-70">{tanggal(o.tanggal)}</p>
            <ul className="mt-3 space-y-1">
              {o.items.map((i) => (
                <li key={i.id} className="flex justify-between gap-3 text-sm">
                  <span>
                    {i.nama} x{i.jumlah}
                  </span>
                  <span>{rupiah(i.harga * i.jumlah)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right font-semibold">
              Total: {rupiah(o.total)}
            </p>
            <p className="mt-2 text-sm opacity-70">Kirim ke: {o.alamat}</p>
            {LABEL_TOMBOL[o.status] && (
              <button
                onClick={() => majukan(o.id)}
                className="mt-4 w-full rounded-full bg-hijau px-5 py-3 font-semibold text-krem"
              >
                {LABEL_TOMBOL[o.status]}
              </button>
            )}
            {o.status === "DIKIRIM" && (
              <p className="mt-4 text-center text-sm opacity-70">
                Menunggu konfirmasi dari pembeli.
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
