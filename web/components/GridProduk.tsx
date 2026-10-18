export default function GridProduk({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-2 gap-3 px-[5vw] pt-6 pb-16 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
      {children}
    </section>
  );
}