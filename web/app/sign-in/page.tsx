"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

const kolom =
  "w-full rounded-full border-2 border-hijau bg-transparent px-5 py-3";
const label = "mb-1 block text-sm font-semibold";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="font-judul text-3xl font-bold text-hijau">Masuk</h1>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={kolom}
          />
        </div>
        <div>
          <label htmlFor="password" className={label}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={kolom}
          />
        </div>
        <button
          type="submit"
          disabled={proses}
          className="min-h-11 w-full rounded-full bg-hijau px-5 py-3 font-semibold text-krem disabled:opacity-50"
        >
          {proses ? "Masuk..." : "Masuk"}
        </button>
      </form>
      <p className="text-sm">
        Belum punya akun?{" "}
        <Link
          href="/sign-up"
          className="inline-block py-2 font-semibold text-hijau underline"
        >
          Daftar
        </Link>
      </p>
    </main>
  );
}
