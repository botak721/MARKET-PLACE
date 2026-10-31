export default function SkeletonGrid({
  jumlah = 8,
  sempit = false,
}: {
  jumlah?: number;
  sempit?: boolean;
}) {
  const kelas = sempit
    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:gap-6"
    : "grid grid-cols-2 gap-3 px-[5vw] pt-6 pb-16 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6";

  return (
    <>
      <p role="status" className="sr-only">
        Memuat produk
      </p>
      <div aria-hidden="true" className={kelas}>
        {Array.from({ length: jumlah }, (_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl bg-kartu p-2.5 pb-3.5 motion-reduce:animate-none sm:p-3.5 sm:pb-5"
          >
            <div className="aspect-square rounded-2xl bg-[#e8e4d8]" />
            <div className="mt-3 h-4 w-3/4 rounded-full bg-[#e8e4d8]" />
            <div className="mt-2 h-4 w-1/3 rounded-full bg-[#e8e4d8]" />
            <div className="mt-4 h-11 rounded-full bg-[#e8e4d8]" />
          </div>
        ))}
      </div>
    </>
  );
}