"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FormUlasan from "@/components/FormUlasan";
import { useSession } from "@/lib/auth-client";
import { infoStatus } from "@/lib/status";
import { warnaDari } from "@/lib/warna";
import { ambilPesananSaya, terimaPesanan } from "./actions";
import {
  mulaiPembayaran,
  sinkronkanPembayaran,
  batalkanPembayaran,
} from "./pembayaran";

type Pesanan = Awaited<ReturnType<typeof ambilPesananSaya>>[number];

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

const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const GRUP: { kode: string; label: string; cocok: (s: string) => boolean }[] = [
  { kode: "semua", label: "Semua", cocok: () => true },
  { kode: "bayar", label: "Menunggu pembayaran", cocok: (s) => s === "MENUNGGU_BAYAR" },
  { kode: "proses", label: "Diproses", cocok: (s) => s === "MENUNGGU" || s === "DIPROSES" },
  { kode: "kirim", label: "Dikirim", cocok: (s) => s === "DIKIRIM" },
  { kode: "selesai", label: "Selesai", cocok: (s) => s === "SELESAI" },
  { kode: "batal", label: "Dibatalkan", cocok: (s) => s === "DIBATALKAN" },
];

const tombolUtama =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-biru px-5 text-sm font-semibold text-white shadow-md shadow-biru/20 transition-colors hover:bg-biru-tua";
const tombolSekunder =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold transition-colors hover:bg-slate-50";

export default function PesananPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [pesanan, setPesanan] = useState<Pesanan[] | undefined>(undefined);
  const [info, setInfo] = useState<string | null>(null);
  const [filter, setFilter] = useState("semua");

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

  async function muatUlang() {
    await sinkronkanPembayaran();
    setPesanan(await ambilPesananSaya());
  }

  async function terima(id: number) {
    await terimaPesanan(id);
    setPesanan(await ambilPesananSaya());
  }

  async function bayar(paymentId: number | null) {
    if (paymentId === null) return;
    setInfo(null);
    const hasil = await mulaiPembayaran(paymentId);
    if (hasil.error || !hasil.token) {
      setInfo(hasil.error);
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
    ) {
      return;
    }
    await batalkanPembayaran(paymentId);
    await muatUlang();
  }

  if (isPending || pesanan === undefined) {
    return (
      <>
        <Header />
        <p className="px-4 py-12 text-center sm:px-6">Memuat pesanan...</p>
      </>
    );
  }

  const aktif = GRUP.find((g) => g.kode === filter) ?? GRUP[0];
  const tampil = pesanan.filter((o) => aktif.cocok(o.status));
  const nilaiTransaksi = pesanan
    .filter((o) => o.status !== "DIBATALKAN" && o.status !== "MENUNGGU_BAYAR")
    .reduce((s, o) => s + o.total, 0);

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-judul text-3xl font-bold sm:text-4xl">Pesananku</h1>
            <p className="mt-1 max-w-xl text-slate-600">
              Pantau status pesananmu, bayar yang masih menunggu, dan konfirmasi
              barang yang sudah sampai.
            </p>
          </div>
          <dl className="flex gap-6 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-kartu">
            <div>
              <dt className="text-xs text-slate-600">Total pesanan</dt>
              <dd className="font-judul text-2xl font-bold">{pesanan.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Nilai transaksi</dt>
              <dd className="font-judul text-2xl font-bold text-biru tabular-nums">
                {rupiah(nilaiTransaksi)}
              </dd>
            </div>
          </dl>
        </div>

        {info && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
            {info}
          </p>
        )}

        {pesanan.length > 0 && (
          <div
            role="group"
            aria-label="Saring berdasarkan status"
            className="scrollbar-hide -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
          >
            {GRUP.map((g) => {
              const n = pesanan.filter((o) => g.cocok(o.status)).length;
              const dipilih = g.kode === filter;
              return (
                <button
                  key={g.kode}
                  type="button"
                  onClick={() => setFilter(g.kode)}
                  aria-pressed={dipilih}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                    dipilih
                      ? "border-navy bg-navy text-white"
                      : "border-slate-300 bg-white hover:bg-slate-50"
                  }`}
                >
                  {g.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${dipilih ? "bg-white/20" : "bg-slate-100"}`}
                  >
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {pesanan.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-kartu">
            <h2 className="font-judul text-xl font-bold">Belum ada pesanan</h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
              Pesanan yang kamu buat akan muncul di sini.
            </p>
            <Link href="/#produk" className={`${tombolUtama} mt-6`}>
              Mulai belanja
            </Link>
          </div>
        )}

        {pesanan.length > 0 && tampil.length === 0 && (
          <p className="mt-8 text-slate-600">
            Tidak ada pesanan dengan status ini.
          </p>
        )}

        <ul className="mt-6 space-y-5">
          {tampil.map((o) => {
            const st = infoStatus(o.status);
            const warna = warnaDari(o.toko);
            const huruf = (Array.from(o.toko.trim())[0] ?? "?").toUpperCase();
            return (
              <li
                key={o.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-kartu"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: warna.bg, color: warna.teks }}
                    >
                      {huruf}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-judul truncate text-lg font-bold">
                        {o.toko}
                      </h2>
                      <p className="text-xs text-slate-600">
                        Pesanan #{o.id}, {tanggal(o.tanggal)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/toko/${o.tokoSlug}`}
                      className="hidden min-h-11 items-center text-sm font-semibold text-biru hover:underline sm:inline-flex"
                    >
                      Kunjungi toko
                    </Link>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${st.kelas}`}
                    >
                      {st.label}
                    </span>
                  </div>
                </div>

                <ul className="divide-y divide-slate-100">
                  {o.items.map((i) => (
                    <li key={i.id} className="space-y-3 px-5 py-4">
                      <div className="flex items-center gap-4">
                        <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {i.gambar ? (
                            <img
                              src={i.gambar}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="font-judul flex h-full w-full items-center justify-center text-xl font-bold"
                              style={{ backgroundColor: warna.bg, color: warna.teks }}
                            >
                              {(Array.from(i.nama.trim())[0] ?? "?").toUpperCase()}
                            </span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          {i.productId !== null ? (
                            <Link
                              href={`/produk/${i.productId}`}
                              className="line-clamp-2 font-bold hover:underline"
                            >
                              {i.nama}
                            </Link>
                          ) : (
                            <p className="line-clamp-2 font-bold">{i.nama}</p>
                          )}
                          <p className="text-sm text-slate-600 tabular-nums">
                            {i.jumlah} barang × {rupiah(i.harga)}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold tabular-nums">
                          {rupiah(i.harga * i.jumlah)}
                        </p>
                      </div>

                      {o.status === "SELESAI" && i.productId !== null && (
                        i.sudahDiulas ? (
                          <p className="text-sm text-slate-600">
                            Sudah diulas. Terima kasih!
                          </p>
                        ) : (
                          <FormUlasan orderItemId={i.id} onSelesai={muatUlang} />
                        )
                      )}
                    </li>
                  ))}
                </ul>

                <div className="space-y-3 border-t border-slate-100 px-5 py-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-tinta">Dikirim ke:</span>{" "}
                    {o.alamat}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-600">
                        {o.status === "MENUNGGU_BAYAR" ? "Total pembayaran" : "Total pesanan"}
                      </p>
                      <p className="font-judul text-xl font-bold tabular-nums">
                        {rupiah(o.status === "MENUNGGU_BAYAR" ? o.totalBayar : o.total)}
                      </p>
                      {o.status === "MENUNGGU_BAYAR" && o.totalBayar !== o.total && (
                        <p className="text-xs text-slate-600">
                          Dibayar bersama pesanan dari toko lain di checkout ini.
                        </p>
                      )}
                    </div>

                    {o.status === "MENUNGGU_BAYAR" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => batalBayar(o.paymentId)}
                          className={tombolSekunder}
                        >
                          Batalkan pembayaran
                        </button>
                        <button
                          type="button"
                          onClick={() => bayar(o.paymentId)}
                          className={tombolUtama}
                        >
                          Bayar sekarang
                        </button>
                      </div>
                    )}
                    {o.status === "DIKIRIM" && (
                      <button
                        type="button"
                        onClick={() => terima(o.id)}
                        className={tombolUtama}
                      >
                        Pesanan diterima
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <Footer />
    </>
  );
}
