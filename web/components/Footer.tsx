import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-4 border-t border-hijau/10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-[5vw] py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-judul text-lg font-bold text-hijau">Rizki Online Shop</p>
        <nav className="flex gap-5 font-semibold text-hijau">
          <Link href="/keranjang">Keranjang</Link>
          <Link href="/pesanan">Pesanan</Link>
          <Link href="/dashboard">Jual barang</Link>
        </nav>
        <p className="opacity-60">
          Proyek belajar. Pembayaran masih mode uji coba.
        </p>
      </div>
    </footer>
  );
}