"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buatSnap,
  batalDiMidtrans,
  batalkanSemua,
  segarkanPembayaran,
} from "@/lib/midtrans";

async function sesi() {
  return auth.api.getSession({ headers: await headers() });
}

export async function mulaiPembayaran(paymentId: number) {
  const s = await sesi();
  if (!s?.user) return { error: "Masuk dulu.", token: null };

  const p = await prisma.payment.findFirst({
    where: { id: paymentId, buyerId: s.user.id, status: "PENDING" },
  });
  if (!p) {
    return { error: "Pembayaran tidak ditemukan atau sudah selesai.", token: null };
  }

  try {
    let token = p.snapToken;
    if (!token) {
      token = await buatSnap(p.kode, p.total, {
        nama: s.user.name,
        email: s.user.email,
      });
      await prisma.payment.update({ where: { id: p.id }, data: { snapToken: token } });
    }
    return { error: null, token };
  } catch {
    return {
      error: "Gagal menghubungi Midtrans. Cek kunci API di .env.local.",
      token: null,
    };
  }
}

export async function sinkronkanPembayaran() {
  const s = await sesi();
  if (!s?.user) return;

  const daftar = await prisma.payment.findMany({
    where: { buyerId: s.user.id, status: "PENDING" },
  });
  for (const p of daftar) {
    try {
      await segarkanPembayaran(p);
    } catch {
      // dicoba lagi saat halaman dibuka berikutnya
    }
  }
}

export async function batalkanPembayaran(paymentId: number) {
  const s = await sesi();
  if (!s?.user) return;

  const p = await prisma.payment.findFirst({
    where: { id: paymentId, buyerId: s.user.id, status: "PENDING" },
  });
  if (!p) return;

  try {
    if (p.snapToken) {
      await segarkanPembayaran(p);
      const terbaru = await prisma.payment.findUnique({
        where: { id: p.id },
        select: { status: true },
      });
      if (terbaru?.status !== "PENDING") return;
      await batalDiMidtrans(p.kode);
    }
  } catch {
    return;
  }
  await batalkanSemua(p.id);
}