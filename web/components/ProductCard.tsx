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
  const foto = gambar ? (
    <img
      src={gambar}
      alt={nama}
      loading="lazy"
      className="mb-2.5 aspect-square w-full rounded-2xl object-cover sm:mb-3.5"
    />
  ) : (
    <div className="mb-2.5 aspect-square rounded-2xl bg-[#d9cdb8] sm:mb-3.5" />
  );

  return (
    <article className="flex flex-col rounded-3xl bg-kartu p-2.5 pb-3.5 transition-transform hover:-translate-y-1.5 sm:p-3.5 sm:pb-5">
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
      <p className="mt-2 font-semibold text-hijau sm:mt-2.5">
        Rp{harga.toLocaleString("id-ID")}
      </p>
      {jumlahUlasan ? (
        <p className="mt-1 text-xs sm:text-sm">
          <span className="text-[#d99a1e]">★</span>{" "}
          {(rata ?? 0).toLocaleString("id-ID", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}{" "}
          <span className="opacity-60">({jumlahUlasan})</span>
        </p>
      ) : null}
      {id !== undefined && (
        <div className="mt-auto">
          <TambahKeranjang productId={id} stok={stok} ringkas />
        </div>
      )}
    </article>
  );
}