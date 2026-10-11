import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

const data = [
  { nama: "Toko Rotan Kita", slug: "toko-rotan-kita", produk: [{ nama: "Tas Anyaman Rotan", harga: 185000 }] },
  { nama: "Kopi Pagi", slug: "kopi-pagi", produk: [{ nama: "Kopi Gayo 250 gram", harga: 72000 }] },
  { nama: "Kanvas Lokal", slug: "kanvas-lokal", produk: [{ nama: "Tote Bag Kanvas", harga: 89000 }] },
  { nama: "Nyala Studio", slug: "nyala-studio", produk: [{ nama: "Lilin Aromaterapi", harga: 65000 }] },
  { nama: "Tanah Liat Co", slug: "tanah-liat-co", produk: [{ nama: "Mug Keramik Handmade", harga: 95000 }] },
  { nama: "Madu Rimba", slug: "madu-rimba", produk: [{ nama: "Madu Hutan 500 ml", harga: 120000 }] },
  { nama: "Racik Alami", slug: "racik-alami", produk: [{ nama: "Sabun Herbal Batang", harga: 28000 }] },
  { nama: "Samak Jaya", slug: "samak-jaya", produk: [{ nama: "Dompet Kulit Sapi", harga: 210000 }] },
];

async function main() {
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  for (const t of data) {
    await prisma.store.create({
      data: { nama: t.nama, slug: t.slug, products: { create: t.produk } },
    });
  }
  console.log("Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());