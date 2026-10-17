import { prisma } from "@/lib/prisma";

const SNAP_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";
const API_URL = "https://api.sandbox.midtrans.com/v2";

export type StatusMidtrans = {
  transaction_status?: string;
  fraud_status?: string;
  gross_amount?: string;
};

function header() {
  const kunci = process.env.MIDTRANS_SERVER_KEY;
  if (!kunci) throw new Error("MIDTRANS_SERVER_KEY belum diisi");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Basic " + Buffer.from(kunci + ":").toString("base64"),
  };
}

export async function buatSnap(
  kode: string,
  total: number,
  pembeli: { nama: string; email: string },
) {
  const res = await fetch(SNAP_URL, {
    method: "POST",
    headers: header(),
    cache: "no-store",
    body: JSON.stringify({
      transaction_details: { order_id: kode, gross_amount: total },
      customer_details: { first_name: pembeli.nama, email: pembeli.email },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) throw new Error("Snap gagal dibuat");
  return data.token as string;
}

export async function cekStatus(kode: string): Promise<StatusMidtrans> {
  const res = await fetch(`${API_URL}/${encodeURIComponent(kode)}/status`, {
    headers: header(),
    cache: "no-store",
  });
  return res.json();
}

export async function batalDiMidtrans(kode: string) {
  await fetch(`${API_URL}/${encodeURIComponent(kode)}/cancel`, {
    method: "POST",
    headers: header(),
    cache: "no-store",
  });
}

export async function batalkanSemua(paymentId: number) {
  await prisma.$transaction(async (tx) => {
    const h = await tx.payment.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: { status: "FAILED" },
    });
    if (h.count === 0) return;

    const pesanan = await tx.order.findMany({
      where: { paymentId, status: "MENUNGGU_BAYAR" },
      select: { items: { select: { productId: true, jumlah: true } } },
    });
    for (const o of pesanan) {
      for (const i of o.items) {
        if (i.productId === null) continue;
        await tx.product.updateMany({
          where: { id: i.productId },
          data: { stok: { increment: i.jumlah } },
        });
      }
    }
    await tx.order.updateMany({
      where: { paymentId, status: "MENUNGGU_BAYAR" },
      data: { status: "DIBATALKAN" },
    });
  });
}

export async function terapkanStatus(paymentId: number, data: StatusMidtrans) {
  const p = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!p || p.status !== "PENDING" || !data.transaction_status) return;

  const ts = data.transaction_status;
  const lunas =
    ts === "settlement" || (ts === "capture" && data.fraud_status === "accept");
  const gagal = ["deny", "cancel", "expire", "failure"].includes(ts);

  if (lunas) {
    if (Number(data.gross_amount) !== p.total) return;
    await prisma.$transaction(async (tx) => {
      const h = await tx.payment.updateMany({
        where: { id: p.id, status: "PENDING" },
        data: { status: "PAID" },
      });
      if (h.count === 0) return;
      await tx.order.updateMany({
        where: { paymentId: p.id, status: "MENUNGGU_BAYAR" },
        data: { status: "MENUNGGU" },
      });
    });
  } else if (gagal) {
    await batalkanSemua(p.id);
  }
}

export async function segarkanPembayaran(p: {
  id: number;
  kode: string;
  createdAt: Date;
}) {
  const data = await cekStatus(p.kode);
  if (data.transaction_status) {
    await terapkanStatus(p.id, data);
  } else if (Date.now() - p.createdAt.getTime() > 24 * 60 * 60 * 1000) {
    await batalkanSemua(p.id);
  }
}