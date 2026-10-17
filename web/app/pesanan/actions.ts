"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";

const URUTAN = ["MENUNGGU", "DIPROSES", "DIKIRIM"];

async function idPengguna() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function buatPesanan(alamat: string) {
  const uid = await idPengguna();
  if (!uid) return { error: "Masuk dulu untuk checkout." };

  const alamatBersih = alamat.trim();
  if (alamatBersih.length < 10) {
    return { error: "Alamat pengiriman minimal 10 karakter." };
  }

  const keranjang = await prisma.cartItem.findMany({
    where: { userId: uid },
    include: {
      product: {
        include: { store: { select: { id: true, ownerId: true } } },
      },
    },
  });
  if (keranjang.length === 0) return { error: "Keranjangmu kosong." };
  if (keranjang.some((k) => k.product.store.ownerId === uid)) {
    return {
      error:
        "Keranjang berisi produk tokomu sendiri. Hapus dulu dari keranjang.",
    };
  }

  const perToko = new Map<number, typeof keranjang>();
  for (const k of keranjang) {
    const daftar = perToko.get(k.product.store.id) ?? [];
    daftar.push(k);
    perToko.set(k.product.store.id, daftar);
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const k of keranjang) {
        const hasil = await tx.product.updateMany({
          where: { id: k.productId, stok: { gte: k.jumlah } },
          data: { stok: { decrement: k.jumlah } },
        });
        if (hasil.count === 0) throw new Error(`STOK:${k.product.nama}`);
      }

      const pembayaran = await tx.payment.create({
        data: {
          kode: `RS-${randomUUID()}`,
          buyerId: uid,
          total: keranjang.reduce((s, k) => s + k.product.harga * k.jumlah, 0),
        },
      });

      for (const [storeId, daftar] of perToko) {
        await tx.order.create({
          data: {
            buyerId: uid,
            status: "MENUNGGU_BAYAR",
            storeId,
            paymentId: pembayaran.id,
            alamat: alamatBersih,
            total: daftar.reduce((s, k) => s + k.product.harga * k.jumlah, 0),
            items: {
              create: daftar.map((k) => ({
                productId: k.productId,
                nama: k.product.nama,
                harga: k.product.harga,
                jumlah: k.jumlah,
              })),
            },
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: uid } });
    });
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("STOK:")) {
      return { error: `Stok ${e.message.slice(5)} tidak cukup.` };
    }
    throw e;
  }
  return { error: null };
}

export async function ambilPesananSaya() {
  const uid = await idPengguna();
  if (!uid) return [];

  const pesanan = await prisma.order.findMany({
    where: { buyerId: uid },
    include: {
      store: { select: { nama: true } },
      payment: { select: { total: true } },
      items: { include: { review: { select: { id: true } } } },
    },
    orderBy: { id: "desc" },
  });

  return pesanan.map((o) => ({
    id: o.id,
    toko: o.store.nama,
    status: o.status,
    paymentId: o.paymentId,
    totalBayar: o.payment?.total ?? o.total,
    total: o.total,
    alamat: o.alamat,
    tanggal: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      nama: i.nama,
      harga: i.harga,
      jumlah: i.jumlah,
      productId: i.productId,
      sudahDiulas: i.review !== null,
    })),
  }));
}

export async function ambilPesananToko() {
  const uid = await idPengguna();
  if (!uid) return [];

  const toko = await prisma.store.findUnique({
    where: { ownerId: uid },
    select: { id: true },
  });
  if (!toko) return [];

  const pesanan = await prisma.order.findMany({
    where: {
      storeId: toko.id,
      OR: [{ paymentId: null }, { payment: { status: "PAID" } }],
    },
    include: { buyer: { select: { name: true } }, items: true },
    orderBy: { id: "desc" },
  });

  return pesanan.map((o) => ({
    id: o.id,
    pembeli: o.buyer.name,
    status: o.status,
    total: o.total,
    alamat: o.alamat,
    tanggal: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      nama: i.nama,
      harga: i.harga,
      jumlah: i.jumlah,
    })),
  }));
}

export async function majukanStatus(orderId: number) {
  const uid = await idPengguna();
  if (!uid) return;

  const toko = await prisma.store.findUnique({
    where: { ownerId: uid },
    select: { id: true },
  });
  if (!toko) return;

  const order = await prisma.order.findFirst({
    where: { id: orderId, storeId: toko.id },
  });
  if (!order) return;

  const idx = URUTAN.indexOf(order.status);
  if (idx < 0 || idx >= URUTAN.length - 1) return;

  await prisma.order.updateMany({
    where: { id: order.id, status: order.status },
    data: { status: URUTAN[idx + 1] },
  });
}

export async function terimaPesanan(orderId: number) {
  const uid = await idPengguna();
  if (!uid) return;

  await prisma.order.updateMany({
    where: { id: orderId, buyerId: uid, status: "DIKIRIM" },
    data: { status: "SELESAI" },
  });
}

export async function kirimUlasan(
  orderItemId: number,
  bintang: number,
  komentar: string,
) {
  const uid = await idPengguna();
  if (!uid) return { error: "Masuk dulu untuk memberi ulasan." };

  if (!Number.isInteger(bintang) || bintang < 1 || bintang > 5) {
    return { error: "Pilih jumlah bintang dulu." };
  }
  const teks = komentar.trim();
  if (teks.length > 500) return { error: "Komentar maksimal 500 karakter." };

  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, order: { buyerId: uid, status: "SELESAI" } },
    include: { review: { select: { id: true } } },
  });
  if (!item || item.productId === null) {
    return { error: "Barang ini belum bisa diulas." };
  }
  if (item.review) return { error: "Kamu sudah mengulas barang ini." };

  const produk = await prisma.product.findUnique({
    where: { id: item.productId },
    select: { id: true },
  });
  if (!produk) return { error: "Produk ini sudah tidak dijual." };

  try {
    await prisma.review.create({
      data: {
        bintang,
        komentar: teks || null,
        userId: uid,
        productId: produk.id,
        orderItemId: item.id,
      },
    });
  } catch {
    return { error: "Ulasan gagal disimpan. Coba lagi." };
  }
  return { error: null };
}
