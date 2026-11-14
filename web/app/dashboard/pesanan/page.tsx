"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";
import { infoStatus } from "@/lib/status";
import { ambilPesananToko, majukanStatus } from "@/app/pesanan/actions";

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

const GRUP: { kode: string; label: string; cocok: (s: string) => boolean }[] = [
  { kode: "semua", label: "Semua pesanan", cocok: () => true },
  { kode: "proses", label: "Perlu diproses", cocok: (s) => s === "MENUNGGU" },
  { kode: "kemas", label: "Dikemas", cocok: (s) => s === "DIPROSES" },
  { kode: "kirim", label: "Dikirim", cocok: (s) => s === "DIKIRIM" },
  { kode: "selesai", label: "Selesai", cocok: (s) => s === "SELESAI" },
  { kode: "batal", label: "Dibatalkan", cocok: (s) => s === "DIBATALKAN" },
];

export default function PesananMasukPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [pesanan, setPesanan] = useState<Pesanan[] | undefined>(undefined);
  const [filter, setFilter] = useState("semua");

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
    return (
      <>
        <Header />
        <p className="px-4 py-12 text-center sm:px-6">Memuat pesanan...</p>
      </>
    );
  }

  const aktif = GRUP.find((g) => g.kode === filter) ?? GRUP[0];
  const tampil = pesanan.filter((o) => aktif.cocok(o.status));
  const jml = (kode: string) =>
    pesanan.filter((o) => (GRUP.find((g) => g.kode === kode) ?? GRUP[0]).cocok(o.status)).length;

  const statistik = [
    { label: "Total pesanan", nilai: pesanan.length, sorot: false },
    { label: "Perlu diproses", nilai: jml("proses"), sorot: jml("proses") > 0 },
    { label: "Dikemas dan dikirim", nilai: jml("kemas") + jml("kirim"), sorot: false },
    { label: "Selesai", nilai: jml("selesai"), sorot: false },
  ];

  return (
    <>
      <Header />
      <main>
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
            <nav
              aria-label="Jejak halaman"
              className="flex flex-wrap items-center gap-x-1 text-sm text-slate-300"
            >
              <Link href="/dashboard" className="inline-flex min-h-11 items-center hover:text-white">
                Dashboard penjual
              </Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span aria-current="page" className="font-semibold text-white">
                Pesanan masuk
              </span>
            </nav>
            <div className="mt-2 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="font-judul text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Pesanan masuk
                </h1>
                <p className="mt-2 max-w-xl text-slate-300">
                  Pesanan yang sudah dibayar muncul di sini. Proses dan kirim
                  barangnya, lalu tunggu pembeli menekan &quot;Pesanan diterima&quot;.
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {statistik.map((s) => (
                  <div
                    key={s.label}
                    className={`flex flex-col-reverse rounded-2xl border p-4 ${s.sorot ? "border-biru bg-biru" : "border-white/10 bg-white/5"}`}
                  >
                    <dt className="text-xs text-slate-200">{s.label}</dt>
                    <dd className="font-judul text-2xl font-bold tabular-nums">
                      {s.nilai}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
          {pesanan.length > 0 && (
            <div
              role="group"
              aria-label="Saring berdasarkan status"
              className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
            >
              {GRUP.map((g) => {
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
                      {jml(g.kode)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {pesanan.length === 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-kartu">
              <h2 className="font-judul text-xl font-bold">Belum ada pesanan masuk</h2>
              <p className="mx-auto mt-2 max-w-md text-slate-600">
                Pesanan muncul di sini setelah pembeli membayar.
              </p>
            </div>
          )}

          {pesanan.length > 0 && tampil.length === 0 && (
            <p className="mt-6 text-slate-600">Tidak ada pesanan dengan status ini.</p>
          )}

          <ul className="mt-6 space-y-5">
            {tampil.map((o) => {
              const st = infoStatus(o.status);
              return (
                <li
                  key={o.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-kartu"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <div>
                      <h2 className="font-judul text-lg font-bold">
                        Pesanan #{o.id}
                      </h2>
                      <p className="text-xs text-slate-600">
                        Dari {o.pembeli}, {tanggal(o.tanggal)}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.kelas}`}>
                      {st.label}
                    </span>
                  </div>

                  <div className="grid gap-5 p-5 md:grid-cols-[1fr_20rem]">
                    <ul className="divide-y divide-slate-100">
                      {o.items.map((i) => (
                        <li
                          key={i.id}
                          className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-bold">{i.nama}</p>
                            <p className="text-sm text-slate-600 tabular-nums">
                              {i.jumlah} barang × {rupiah(i.harga)}
                            </p>
                          </div>
                          <p className="shrink-0 font-bold tabular-nums">
                            {rupiah(i.harga * i.jumlah)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-600">Alamat pengiriman</p>
                      <p className="mt-1 text-sm">{o.alamat}</p>
                      <div className="mt-4 border-t border-slate-200 pt-3">
                        <p className="text-xs text-slate-600">Total pesanan</p>
                        <p className="font-judul text-2xl font-extrabold text-biru tabular-nums">
                          {rupiah(o.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(LABEL_TOMBOL[o.status] || o.status === "DIKIRIM") && (
                    <div className="flex justify-end border-t border-slate-100 px-5 py-4">
                      {LABEL_TOMBOL[o.status] ? (
                        <button
                          type="button"
                          onClick={() => majukan(o.id)}
                          className="min-h-11 rounded-full bg-biru px-6 text-sm font-semibold text-white shadow-md shadow-biru/20 transition-colors hover:bg-biru-tua"
                        >
                          {LABEL_TOMBOL[o.status]}
                        </button>
                      ) : (
                        <p className="text-sm text-slate-600">
                          Menunggu konfirmasi dari pembeli.
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
