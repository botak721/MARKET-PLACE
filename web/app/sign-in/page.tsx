"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { KartuAuth, KolomIsian, KolomSandi } from "@/components/FormAuth";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [proses, setProses] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setProses(true);
    const formData = new FormData(e.currentTarget);

    const res = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    setProses(false);

    if (res.error) {
      setError(
        res.error.status === 401
          ? "Email atau password salah."
          : res.error.message || "Terjadi kesalahan.",
      );
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-[60vh] px-4 py-12 sm:px-6">
        <KartuAuth
          aktif="masuk"
          judul="Masuk ke akunmu"
          subjudul="Lihat pesanan, kelola tokomu, dan lanjutkan belanja."
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
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={proses}
              className="h-12 w-full rounded-full bg-biru font-semibold text-white shadow-lg shadow-biru/25 transition-colors hover:bg-biru-tua disabled:opacity-60"
            >
              {proses ? "Masuk..." : "Masuk"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link
              href="/sign-up"
              className="inline-flex min-h-11 items-center font-semibold text-biru underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </KartuAuth>
      </main>
      <Footer />
    </>
  );
}
