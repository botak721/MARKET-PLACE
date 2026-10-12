"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const res = await signUp.email({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (res.error) {
      setError(res.error.message || "Terjadi kesalahan.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="font-judul text-3xl font-bold text-hijau">Daftar</h1>
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Nama lengkap"
          required
          className="w-full rounded-full border-2 border-hijau bg-transparent px-5 py-3"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-full border-2 border-hijau bg-transparent px-5 py-3"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (minimal 8 karakter)"
          required
          minLength={8}
          className="w-full rounded-full border-2 border-hijau bg-transparent px-5 py-3"
        />
        <button
          type="submit"
          className="w-full rounded-full bg-hijau px-5 py-3 font-semibold text-krem"
        >
          Buat akun
        </button>
      </form>
      <p className="text-sm">
        Sudah punya akun?{" "}
        <Link href="/sign-in" className="font-semibold text-hijau underline">
          Masuk
        </Link>
      </p>
    </main>
  );
}