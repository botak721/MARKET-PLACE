"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KartuAuth, KolomIsian, KolomSandi } from "@/components/FormAuth";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setProses(true);
    const formData = new FormData(e.currentTarget);

    const res = await signUp.email({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    setProses(false);

    if (res.error) {
      setError(res.error.message || "Terjadi kesalahan.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh] px-4 py-12 sm:px-6">
        <KartuAuth
          aktif="daftar"
          judul="Buat akun baru"
          subjudul="Satu akun untuk belanja dan membuka toko."
        >
          {error && (
            <p
              role="alert"
              className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
            >
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <KolomIsian
              id="name"
              name="name"
              label="Nama lengkap"
              ikon="nama"
              autoComplete="name"
            />
            <KolomIsian
              id="email"
              name="email"
              label="Email"
              type="email"
              ikon="email"
              autoComplete="email"
            />
            <KolomSandi
              id="password"
              label="Password"
              autoComplete="new-password"
              petunjuk="Minimal 8 karakter."
              minLength={8}
            />
            <button
              type="submit"
              disabled={proses}
              className="h-12 w-full rounded-full bg-biru font-semibold text-white shadow-lg shadow-biru/25 transition-colors hover:bg-biru-tua disabled:opacity-60"
            >
              {proses ? "Membuat akun..." : "Buat akun"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link
              href="/sign-in"
              className="inline-flex min-h-11 items-center font-semibold text-biru underline"
            >
              Masuk
            </Link>
          </p>
        </KartuAuth>
      </main>
      <Footer />
    </>
  );
}
