"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";
import { adaKategori } from "@/lib/kategori";

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
    select: {
      id: true,
      nama: true,
      harga: true,
      gambar: true,
      stok: true,
      deskripsi: true,
      kategori: true,
    },
  });
}

function bacaGambar(nilai: FormDataEntryValue | null) {
  const teks = String(nilai ?? "").trim();
  if (!teks)
    return { gambar: null as string | null, error: null as string | null };
  try {
    const url = new URL(teks);
    const valid =
      url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com");
    if (!valid) return { gambar: null, error: "Alamat gambar tidak valid." };
    return { gambar: url.toString(), error: null };
  } catch {
    return { gambar: null, error: "Alamat gambar tidak valid." };
  }
}

function bacaProduk(formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  if (nama.length < 2) return { error: "Nama produk minimal 2 karakter." };
  if (nama.length > 100) return { error: "Nama produk maksimal 100 karakter." };

  const harga = Number(formData.get("harga"));
  if (!Number.isInteger(harga) || harga < 100) {
    return { error: "Harga harus angka bulat, minimal 100." };
  }

  const stok = Number(formData.get("stok"));
  if (!Number.isInteger(stok) || stok < 0 || stok > 100000) {
    return { error: "Stok harus angka bulat, 0 sampai 100.000." };
  }

  const deskripsi = String(formData.get("deskripsi") ?? "").trim();
  if (deskripsi.length > 1000) {
    return { error: "Deskripsi maksimal 1.000 karakter." };
  }

  const g = bacaGambar(formData.get("gambar"));
  if (g.error) return { error: g.error };

  const kategoriMasuk = String(formData.get("kategori") ?? "");
  const kategori = adaKategori(kategoriMasuk) ? kategoriMasuk : null;

  return {
    error: null,
    data: {
      nama,
      harga,
      stok,
      deskripsi: deskripsi || null,
      gambar: g.gambar,
      kategori,
    },
  };
}

export async function tambahProduk(formData: FormData) {
  const toko = await ambilTokoSaya();
  if (!toko) return { error: "Buka toko dulu sebelum menambah produk." };

  const hasil = bacaProduk(formData);
  if (!hasil.data) return { error: hasil.error ?? "Data produk tidak valid." };

  await prisma.product.create({ data: { ...hasil.data, storeId: toko.id } });
  return { error: null };
}

export async function editProduk(id: number, formData: FormData) {
  const toko = await ambilTokoSaya();
  if (!toko) return { error: "Buka toko dulu." };

  const lama = await prisma.product.findFirst({
    where: { id, storeId: toko.id },
    select: { gambar: true },
  });
  if (!lama) return { error: "Produk tidak ditemukan." };

  const hasil = bacaProduk(formData);
  if (!hasil.data) return { error: hasil.error ?? "Data produk tidak valid." };

  const { gambar, ...sisa } = hasil.data;
  await prisma.product.updateMany({
    where: { id, storeId: toko.id },
    data: { ...sisa, gambar: gambar ?? lama.gambar },
  });

  if (gambar && lama.gambar && gambar !== lama.gambar) {
    try {
      await del(lama.gambar);
    } catch {
      // file lama gagal dihapus, tidak mengganggu hasil edit
    }
  }
  return { error: null };
}

export async function hapusProduk(id: number) {
  const toko = await ambilTokoSaya();
  if (!toko) return;

  const produk = await prisma.product.findFirst({
    where: { id, storeId: toko.id },
    select: { gambar: true },
  });
  if (!produk) return;

  await prisma.product.deleteMany({ where: { id, storeId: toko.id } });

  if (produk.gambar) {
    try {
      await del(produk.gambar);
    } catch {
      // file gagal dihapus, produknya sudah terhapus dan itu yang penting
    }
  }
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

export async function ambilRingkasan() {
  const toko = await ambilTokoSaya();
  if (!toko) return null;

  const [perStatus, terlaris] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: {
        storeId: toko.id,
        OR: [{ paymentId: null }, { payment: { status: "PAID" } }],
      },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["nama"],
      where: {
        order: {
          storeId: toko.id,
          status: "SELESAI",
          OR: [{ paymentId: null }, { payment: { status: "PAID" } }],
        },
      },
      _sum: { jumlah: true },
      orderBy: { _sum: { jumlah: "desc" } },
      take: 3,
    }),
  ]);

  const ambil = (s: string) => perStatus.find((x) => x.status === s);

  return {
    pendapatan: ambil("SELESAI")?._sum.total ?? 0,
    selesai: ambil("SELESAI")?._count._all ?? 0,
    perluDiproses: ambil("MENUNGGU")?._count._all ?? 0,
    dalamProses:
      (ambil("DIPROSES")?._count._all ?? 0) +
      (ambil("DIKIRIM")?._count._all ?? 0),
    terlaris: terlaris.map((t) => ({
      nama: t.nama,
      terjual: t._sum.jumlah ?? 0,
    })),
  };
}
