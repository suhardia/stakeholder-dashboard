"use client";
import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, UserRound } from "lucide-react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="username">Username</label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input id="username" name="username" className="input pl-9" autoComplete="username" autoCapitalize="none" required autoFocus defaultValue={state?.username} key={state?.username ?? ""} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input id="password" name="password" type={show ? "text" : "password"} className="input px-9" autoComplete="current-password" required />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink" aria-label="Tampilkan password">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{state.error}</p>}
      <button className="btn-primary w-full py-2.5" disabled={pending}>{pending ? "Memeriksa…" : "Masuk"}</button>
    </form>
  );
}
