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

export async function ambilTokoSaya() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const toko = await prisma.store.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, nama: true, slug: true },
  });
  return toko;
}

export async function bukaToko(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
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