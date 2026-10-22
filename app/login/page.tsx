import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative text-sm font-semibold tracking-[0.2em] text-brand-100">STAKEHOLDER · 2026</div>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight">Data Stakeholder<br />Papua Barat, Papua<br />&amp; Maluku</h1>
          <p className="mt-4 max-w-md text-brand-100/80">Kelola data pejabat pemerintah daerah, instansi vertikal, dan media dalam satu tempat yang aman.</p>
        </div>
        <div className="relative text-xs text-brand-100/60">Akses terbatas — hanya untuk pengguna terdaftar.</div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">S</div>
            <h2 className="text-2xl font-bold">Masuk</h2>
            <p className="mt-1 text-sm text-muted">Gunakan username dan password yang diberikan administrator.</p>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
