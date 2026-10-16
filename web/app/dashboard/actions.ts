"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function buatSlug(nama: string) {
  return nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ambilSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function ambilTokoSaya() {
  const session = await ambilSession();
  if (!session?.user) return null;

  return prisma.store.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, nama: true, slug: true },
  });
}

export async function bukaToko(formData: FormData) {
  const session = await ambilSession();
  if (!session?.user) return { error: "Silakan masuk dulu." };

  const nama = String(formData.get("nama") ?? "").trim();
  if (nama.length < 3) return { error: "Nama toko minimal 3 karakter." };

  const slug = buatSlug(nama);
  if (!slug) return { error: "Nama toko tidak valid." };

  const sudahPunya = await prisma.store.findUnique({
    where: { ownerId: session.user.id },
  });
  if (sudahPunya) return { error: "Kamu sudah punya toko." };

  const bentrok = await prisma.store.findUnique({ where: { slug } });
  if (bentrok) return { error: "Nama toko sudah dipakai, coba nama lain." };

  await prisma.store.create({
    data: { nama, slug, ownerId: session.user.id },
  });
  return { error: null };
}

export async function ambilProdukSaya() {
  const toko = await ambilTokoSaya();
  if (!toko) return [];

  return prisma.product.findMany({
    where: { storeId: toko.id },
    orderBy: { id: "desc" },
    select: { id: true, nama: true, harga: true, gambar: true, stok: true },
  });
}

export async function tambahProduk(formData: FormData) {
  const toko = await ambilTokoSaya();
  if (!toko) return { error: "Buka toko dulu sebelum menambah produk." };

  const nama = String(formData.get("nama") ?? "").trim();
  if (nama.length < 2) return { error: "Nama produk minimal 2 karakter." };

  const harga = Number(formData.get("harga"));
  if (!Number.isInteger(harga) || harga < 100) {
    return { error: "Harga harus angka bulat, minimal 100." };
  }

  const stok = Number(formData.get("stok"));
  if (!Number.isInteger(stok) || stok < 0 || stok > 100000) {
    return { error: "Stok harus angka bulat, 0 sampai 100.000." };
  }

  let gambar: string | null = null;
  const urlGambar = String(formData.get("gambar") ?? "").trim();
  if (urlGambar) {
    try {
      const url = new URL(urlGambar);
      const valid =
        url.protocol === "https:" &&
        url.hostname.endsWith(".public.blob.vercel-storage.com");
      if (!valid) return { error: "Alamat gambar tidak valid." };
      gambar = url.toString();
    } catch {
      return { error: "Alamat gambar tidak valid." };
    }
  }

  await prisma.product.create({
    data: { nama, harga, gambar, stok, storeId: toko.id },
  });
  return { error: null };
}

export async function hapusProduk(id: number) {
  const toko = await ambilTokoSaya();
  if (!toko) return;

  await prisma.product.deleteMany({
    where: { id, storeId: toko.id },
  });
}

export async function ubahStok(id: number, stok: number) {
  const toko = await ambilTokoSaya();
  if (!toko) return { error: "Buka toko dulu." };
  if (!Number.isInteger(stok) || stok < 0 || stok > 100000) {
    return { error: "Stok harus angka bulat, 0 sampai 100.000." };
  }

  await prisma.product.updateMany({
    where: { id, storeId: toko.id },
    data: { stok },
  });
  return { error: null };
}
