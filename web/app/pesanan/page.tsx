"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ambilPesananSaya, terimaPesanan } from "./actions";
import {
  mulaiPembayaran,
  sinkronkanPembayaran,
  batalkanPembayaran,
} from "./pembayaran";
import { useSession } from "@/lib/auth-client";
import { infoStatus } from "@/lib/status";
import FormUlasan from "@/components/FormUlasan";

type Pesanan = Awaited<ReturnType<typeof ambilPesananSaya>>[number];

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function PesananPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [pesanan, setPesanan] = useState<Pesanan[] | undefined>(undefined);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) router.push("/sign-in");
  }, [isPending, session, router]);

  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) {
      sinkronkanPembayaran()
        .then(() => ambilPesananSaya())
        .then(setPesanan);
    }
  }, [userId]);

  async function terima(id: number) {
    await terimaPesanan(id);
    setPesanan(await ambilPesananSaya());
  }

  async function muatUlang() {
    await sinkronkanPembayaran();
    setPesanan(await ambilPesananSaya());
  }

  type Snap = {
    pay: (
      token: string,
      opsi: {
        onSuccess?: () => void;
        onPending?: () => void;
        onError?: () => void;
        onClose?: () => void;
      },
    ) => void;
  };

  async function bayar(paymentId: number | null) {
    if (paymentId === null) return;
    setInfo(null);
    const hasil = await mulaiPembayaran(paymentId);
    if (hasil.error || !hasil.token) {
      setInfo(hasil.error ?? null);
      return;
    }
    const snap = (window as unknown as { snap?: Snap }).snap;
    if (!snap) {
      setInfo("Jendela pembayaran belum siap, coba lagi sebentar.");
      return;
    }
    snap.pay(hasil.token, {
      onSuccess: muatUlang,
      onPending: muatUlang,
      onError: muatUlang,
      onClose: muatUlang,
    });
  }

  async function batalBayar(paymentId: number | null) {
    if (paymentId === null) return;
    if (
      !confirm(
        "Batalkan pembayaran? Semua pesanan di checkout ini ikut dibatalkan.",
      )
    )
      return;
    await batalkanPembayaran(paymentId);
    await muatUlang();
  }

  if (isPending || pesanan === undefined) {
    return <p className="mt-8 text-center">Memuat pesanan...</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      {info && <p className="mt-4 text-red-600">{info}</p>}

      <Link href="/" className="text-sm font-semibold text-hijau underline">
        Kembali belanja
      </Link>
      <h1 className="font-judul mt-3 text-3xl font-bold text-hijau">
        Pesananku
      </h1>

      {pesanan.length === 0 && <p className="mt-6">Belum ada pesanan.</p>}

      <div className="mt-6 space-y-4">
        {pesanan.map((o) => (
          <section key={o.id} className="rounded-3xl bg-kartu p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-judul text-lg font-bold text-hijau">
                {o.toko}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-sm ${infoStatus(o.status).kelas}`}
              >
                {infoStatus(o.status).label}
              </span>
            </div>
            <p className="mt-1 text-sm opacity-70">
              Pesanan #{o.id}, {tanggal(o.tanggal)}
            </p>
            <ul className="mt-3 space-y-1">
              {o.items.map((i) => (
                <li key={i.id} className="text-sm">
                  <div className="flex justify-between gap-3">
                    <span>
                      {i.nama} x{i.jumlah}
                    </span>
                    <span>{rupiah(i.harga * i.jumlah)}</span>
                  </div>
                  {o.status === "SELESAI" &&
                    i.productId !== null &&
                    (i.sudahDiulas ? (
                      <p className="mt-1 opacity-70">Sudah diulas</p>
                    ) : (
                      <FormUlasan orderItemId={i.id} onSelesai={muatUlang} />
                    ))}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right font-semibold">
              Total: {rupiah(o.total)}
            </p>
            <p className="mt-2 text-sm opacity-70">Dikirim ke: {o.alamat}</p>
            {o.status === "DIKIRIM" && (
              <button
                onClick={() => terima(o.id)}
                className="mt-4 w-full rounded-full bg-hijau px-5 py-3 font-semibold text-krem"
              >
                Pesanan diterima
              </button>
            )}
            {o.status === "MENUNGGU_BAYAR" && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => bayar(o.paymentId)}
                  className="w-full rounded-full bg-hijau px-5 py-3 font-semibold text-krem"
                >
                  Bayar {rupiah(o.totalBayar)}
                </button>
                <button
                  onClick={() => batalBayar(o.paymentId)}
                  className="w-full rounded-full border-2 border-hijau px-5 py-3 font-semibold text-hijau"
                >
                  Batalkan pembayaran
                </button>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
