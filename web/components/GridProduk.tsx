export default function GridProduk({
  children,
  sempit = false,
}: {
  children: React.ReactNode;
  sempit?: boolean;
}) {
  const kelas = sempit
    ? "grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 sm:gap-5 lg:gap-6"
    : "grid grid-cols-2 gap-3 px-[5vw] pt-6 pb-16 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6";
  return <section className={kelas}>{children}</section>;
}