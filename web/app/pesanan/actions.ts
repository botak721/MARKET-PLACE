"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const URUTAN = ["MENUNGGU", "DIPROSES", "DIKIRIM", "SELESAI"];

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
      error: "Keranjang berisi produk tokomu sendiri. Hapus dulu dari keranjang.",
    };
  }

  const perToko = new Map<number, typeof keranjang>();
  for (const k of keranjang) {
    const daftar = perToko.get(k.product.store.id) ?? [];
    daftar.push(k);
    perToko.set(k.product.store.id, daftar);
  }

  const buatan = [...perToko.entries()].map(([storeId, daftar]) =>
    prisma.order.create({
      data: {
        buyerId: uid,
        storeId,
        alamat: alamatBersih,
        total: daftar.reduce((s, k) => s + k.product.harga * k.jumlah, 0),
        items: {
          create: daftar.map((k) => ({
            nama: k.product.nama,
            harga: k.product.harga,
            jumlah: k.jumlah,
          })),
        },
      },
    }),
  );

  await prisma.$transaction([
    ...buatan,
    prisma.cartItem.deleteMany({ where: { userId: uid } }),
  ]);
  return { error: null };
}

export async function ambilPesananSaya() {
  const uid = await idPengguna();
  if (!uid) return [];

  const pesanan = await prisma.order.findMany({
    where: { buyerId: uid },
    include: { store: { select: { nama: true } }, items: true },
    orderBy: { id: "desc" },
  });

  return pesanan.map((o) => ({
    id: o.id,
    toko: o.store.nama,
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

export async function ambilPesananToko() {
  const uid = await idPengguna();
  if (!uid) return [];

  const toko = await prisma.store.findUnique({
    where: { ownerId: uid },
    select: { id: true },
  });
  if (!toko) return [];

  const pesanan = await prisma.order.findMany({
    where: { storeId: toko.id },
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

  await prisma.order.update({
    where: { id: order.id },
    data: { status: URUTAN[idx + 1] },
  });
}