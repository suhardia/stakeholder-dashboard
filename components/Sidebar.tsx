"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { KeyRound, LayoutDashboard, Landmark, LogOut, Menu, Newspaper, Users, X } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ROLE_LABEL, type Role } from "@/lib/roles";

type Props = { user: { full_name: string; username: string; role: Role }; showUsers: boolean };

export default function Sidebar({ user, showUsers }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/stakeholder", label: "Stakeholder", icon: Landmark },
    { href: "/media", label: "Media", icon: Newspaper },
    ...(showUsers ? [{ href: "/users", label: "Pengguna", icon: Users }] : []),
    { href: "/akun", label: "Akun Saya", icon: KeyRound },
  ];
  const isActive = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 font-bold text-white">S</div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-white">Stakeholder 2026</div>
          <div className="text-[11px] text-brand-100/70">Papua Barat · Papua · Maluku</div>
        </div>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive(href) ? "bg-white/12 text-white" : "text-brand-100/75 hover:bg-white/6 hover:text-white"}`}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3">
          <div className="truncate text-sm font-semibold text-white">{user.full_name}</div>
          <div className="text-xs text-brand-100/70">@{user.username} · {ROLE_LABEL[user.role]}</div>
        </div>
        <form action={logout}>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-100/80 transition hover:bg-white/6 hover:text-white">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <div className="font-bold">Stakeholder 2026</div>
        <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Buka menu"><Menu className="h-5 w-5" /></button>
      </header>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 bg-brand-900 lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-900">
            <button className="absolute right-3 top-4 p-1 text-brand-100" onClick={() => setOpen(false)} aria-label="Tutup menu"><X className="h-5 w-5" /></button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
