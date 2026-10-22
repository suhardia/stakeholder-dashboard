"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, size = "md" }: { title: string; onClose: () => void; children: React.ReactNode; size?: "sm" | "md" | "lg" }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  const w = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" className={`relative max-h-[92vh] w-full ${w} overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h2 className="text-base font-bold">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Tutup"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
