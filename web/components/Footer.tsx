import Link from "next/link";

const tautan = "inline-flex min-h-11 items-center";

export default function Footer() {
  return (
    <footer className="mt-8 bg-hijau text-krem">
      <div className="mx-auto grid max-w-[1200px] gap-6 px-[5vw] py-10 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="font-judul text-2xl font-bold">Rizki Online Shop</p>
          <p className="mt-2 max-w-[40ch] text-sm text-krem/85">
            Barang bagus dari toko-toko kecil. Tiap penjual punya etalasenya
            sendiri.
          </p>
        </div>
        <nav
          aria-label="Pintasan"
          className="flex flex-col items-start text-sm font-semibold"
        >
          <Link href="/#produk" className={tautan}>
            Semua produk
          </Link>
          <Link href="/keranjang" className={tautan}>
            Keranjang
          </Link>
          <Link href="/pesanan" className={tautan}>
            Pesananku
          </Link>
          <Link href="/dashboard" className={tautan}>
            Jual barang
          </Link>
        </nav>
      </div>
      <div className="border-t border-krem/20">
        <p className="mx-auto max-w-[1200px] px-[5vw] py-4 text-xs text-krem/80">
          Proyek belajar. Pembayaran masih mode uji coba, tidak ada uang
          sungguhan yang berpindah.
        </p>
      </div>
    </footer>
  );
}