"use client";
import { useActionState, useEffect, useRef } from "react";
import { changeOwnPassword } from "@/app/actions/auth";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.success) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <div><label className="label">Password lama</label><input name="current" type="password" className="input" required autoComplete="current-password" /></div>
      <div><label className="label">Password baru</label><input name="next" type="password" className="input" required minLength={8} maxLength={72} autoComplete="new-password" /></div>
      <div><label className="label">Ulangi password baru</label><input name="confirm" type="password" className="input" required minLength={8} maxLength={72} autoComplete="new-password" /></div>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{state.success}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Menyimpan…" : "Simpan password"}</button>
    </form>
  );
}
