import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cekStatus, terapkanStatus } from "@/lib/midtrans";

type Notifikasi = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
};

export async function POST(request: Request) {
  const kunci = process.env.MIDTRANS_SERVER_KEY;
  if (!kunci) {
    return NextResponse.json({ error: "Konfigurasi belum lengkap" }, { status: 500 });
  }

  let body: Notifikasi;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const { order_id, status_code, gross_amount, signature_key } = body;
  if (!order_id || !status_code || !gross_amount || !signature_key) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const harapan = createHash("sha512")
    .update(order_id + status_code + gross_amount + kunci)
    .digest("hex");
  const a = Buffer.from(harapan);
  const b = Buffer.from(signature_key);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Tanda tangan salah" }, { status: 403 });
  }

  const p = await prisma.payment.findUnique({ where: { kode: order_id } });
  if (!p) return NextResponse.json({ ok: true });

  try {
    const data = await cekStatus(order_id);
    await terapkanStatus(p.id, data);
  } catch {
    return NextResponse.json({ error: "Gagal memproses" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}