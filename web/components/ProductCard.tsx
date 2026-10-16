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
};

const pil =
  "mt-2 inline-block rounded-full bg-[#e3ecdf] px-2.5 py-0.5 text-sm text-hijau";

export default function ProductCard({
  id,
  nama,
  toko,
  harga,
  slug,
  gambar,
  rata,
  jumlahUlasan,
}: Props) {
  const foto = gambar ? (
    <img
      src={gambar}
      alt={nama}
      loading="lazy"
      className="mb-3.5 aspect-square w-full rounded-2xl object-cover"
    />
  ) : (
    <div className="mb-3.5 aspect-square rounded-2xl bg-[#d9cdb8]" />
  );

  return (
    <article className="rounded-3xl bg-kartu p-3.5 pb-5 transition-transform hover:-translate-y-1.5">
      {id !== undefined ? <Link href={`/produk/${id}`}>{foto}</Link> : foto}
      <h2 className="text-base font-semibold">
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
      <p className="mt-2.5 font-semibold text-hijau">
        Rp{harga.toLocaleString("id-ID")}
      </p>
      <p className="mt-1 text-sm">
        {jumlahUlasan ? (
          <>
            <span className="text-[#d99a1e]">★</span>{" "}
            {(rata ?? 0).toLocaleString("id-ID", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            <span className="opacity-60">({jumlahUlasan})</span>
          </>
        ) : (
          <span className="opacity-50">Belum ada ulasan</span>
        )}
      </p>
      {id !== undefined && <TambahKeranjang productId={id} />}
    </article>
  );
}
