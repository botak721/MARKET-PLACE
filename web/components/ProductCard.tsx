import Link from "next/link";
import TambahKeranjang from "@/components/TambahKeranjang";

type Props = {
  id?: number;
  nama: string;
  toko: string;
  harga: number;
  slug?: string;
  gambar?: string | null;
  rata?: number;
  jumlahUlasan?: number;
  stok?: number;
};

const PALET = [
  { bg: "#e3ecdf", teks: "#1f4d3a" },
  { bg: "#f1e0c5", teks: "#7a5a12" },
  { bg: "#dce6f2", teks: "#25496b" },
  { bg: "#f1d9d6", teks: "#8a2f26" },
  { bg: "#e8dff0", teks: "#5a3d73" },
  { bg: "#d9cdb8", teks: "#5c4a2e" },
];

function warnaDari(nama: string) {
  let h = 0;
  for (const c of nama) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALET[h % PALET.length];
}

const pil =
  "mt-1.5 inline-block max-w-full self-start truncate rounded-full bg-[#e3ecdf] px-2.5 py-0.5 text-xs text-hijau sm:mt-2 sm:text-sm";

export default function ProductCard({
  id,
  nama,
  toko,
  harga,
  slug,
  gambar,
  rata,
  jumlahUlasan,
  stok,
}: Props) {
  const warna = warnaDari(nama);
  const huruf = (Array.from(nama.trim())[0] ?? "?").toUpperCase();

  const foto = (
    <div className="relative mb-2.5 sm:mb-3.5">
      {gambar ? (
        <img
          src={gambar}
          alt={nama}
          loading="lazy"
          className="aspect-square w-full rounded-2xl object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-square items-center justify-center rounded-2xl"
          style={{ backgroundColor: warna.bg, color: warna.teks }}
        >
          <span className="font-judul text-5xl font-bold opacity-80 sm:text-6xl">
            {huruf}
          </span>
        </div>
      )}
      {stok === 0 ? (
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-tinta/55 text-sm font-semibold text-kartu">
          Stok habis
        </span>
      ) : stok !== undefined && stok <= 5 ? (
        <span className="absolute top-2 left-2 rounded-full bg-[#f3e6c4] px-2 py-0.5 text-xs font-semibold text-[#7a5a12]">
          Sisa {stok}
        </span>
      ) : null}
    </div>
  );

  return (
    <article className="flex flex-col rounded-3xl bg-kartu p-2.5 pb-3.5 transition-transform hover:-translate-y-1.5 sm:p-3.5 sm:pb-5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {id !== undefined ? <Link href={`/produk/${id}`}>{foto}</Link> : foto}
      <h2 className="line-clamp-2 min-h-10 text-sm font-semibold sm:min-h-12 sm:text-base">
        {id !== undefined ? (
          <Link href={`/produk/${id}`} className="hover:underline">
            {nama}
          </Link>
        ) : (
          nama
        )}
      </h2>
      {slug ? (
        <Link href={`/toko/${slug}`} className={pil}>
          {toko}
        </Link>
      ) : (
        <p className={pil}>{toko}</p>
      )}
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-2 sm:mt-2.5">
        <p className="font-semibold text-hijau">
          Rp{harga.toLocaleString("id-ID")}
        </p>
        {jumlahUlasan ? (
          <p className="shrink-0 text-xs sm:text-sm">
            <span className="text-[#d99a1e]">★</span>{" "}
            {(rata ?? 0).toLocaleString("id-ID", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            <span className="opacity-70">({jumlahUlasan})</span>
          </p>
        ) : null}
      </div>
      {id !== undefined && (
        <div className="mt-auto">
          <TambahKeranjang productId={id} stok={stok} ringkas />
        </div>
      )}
    </article>
  );
}
