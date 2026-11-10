import Link from "next/link";
import { KATEGORI } from "@/lib/kategori";

const tautan =
  "inline-flex min-h-11 items-center text-sm text-slate-300 transition-colors hover:text-white";
const judul = "font-judul text-lg font-semibold text-white";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/10 bg-navy-dasar text-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <p className="font-judul text-xl font-bold">Rizki Online Shop</p>
          <p className="text-sm text-slate-300">
            Marketplace untuk toko-toko kecil, dibuat sebagai proyek belajar web
            fullstack.
          </p>
        </div>

        <nav aria-label="Belanja dan jual">
          <h2 className={judul}>Belanja dan jual</h2>
          <ul className="mt-2">
            <li>
              <Link href="/#produk" className={tautan}>
                Semua produk
              </Link>
            </li>
            <li>
              <Link href="/keranjang" className={tautan}>
                Keranjang
              </Link>
            </li>
            <li>
              <Link href="/pesanan" className={tautan}>
                Pesananku
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className={tautan}>
                Buka toko dan jual
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Kategori">
          <h2 className={judul}>Kategori</h2>
          <ul className="mt-2">
            {KATEGORI.slice(0, 5).map((k) => (
              <li key={k.slug}>
                <Link href={`/?kategori=${k.slug}#produk`} className={tautan}>
                  {k.nama}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className={judul}>Pembayaran</h2>
          <p className="text-sm text-slate-300">
            Pembayaran lewat Midtrans dalam mode uji coba. Tidak ada uang
            sungguhan yang berpindah.
          </p>
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
            Midtrans sandbox
          </span>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1200px] px-4 py-5 text-xs text-slate-400 sm:px-6">
          © 2026 Rizki Online Shop
        </p>
      </div>
    </footer>
  );
}
