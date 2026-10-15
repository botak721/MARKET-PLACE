"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function idPengguna() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function tambahKeKeranjang(productId: number) {
  const uid = await idPengguna();
  if (!uid) return { error: "Masuk dulu untuk mulai belanja." };

  const produk = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: { select: { ownerId: true } } },
  });
  if (!produk) return { error: "Produk tidak ditemukan." };
  if (produk.store.ownerId === uid) {
    return { error: "Kamu tidak bisa membeli produk tokomu sendiri." };
  }

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: uid, productId } },
    create: { userId: uid, productId, jumlah: 1 },
    update: { jumlah: { increment: 1 } },
  });
  return { error: null };
}

export async function ambilKeranjang() {
  const uid = await idPengguna();
  if (!uid) return [];

  const item = await prisma.cartItem.findMany({
    where: { userId: uid },
    include: {
      product: { include: { store: { select: { id: true, nama: true } } } },
    },
    orderBy: { id: "asc" },
  });

  return item.map((i) => ({
    productId: i.productId,
    jumlah: i.jumlah,
    nama: i.product.nama,
    harga: i.product.harga,
    tokoId: i.product.store.id,
    toko: i.product.store.nama,
  }));
}

export async function ubahJumlah(productId: number, jumlahBaru: number) {
  const uid = await idPengguna();
  if (!uid) return;

  if (jumlahBaru <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId: uid, productId } });
  } else {
    await prisma.cartItem.updateMany({
      where: { userId: uid, productId },
      data: { jumlah: Math.min(jumlahBaru, 99) },
    });
  }
}

export async function hapusDariKeranjang(productId: number) {
  const uid = await idPengguna();
  if (!uid) return;
  await prisma.cartItem.deleteMany({ where: { userId: uid, productId } });
}