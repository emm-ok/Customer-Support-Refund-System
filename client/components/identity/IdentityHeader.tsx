import { ShieldCheck } from "lucide-react";

export default function IdentityHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ShieldCheck className="h-7 w-7 text-slate-900" />
      </div>

      <div className="mb-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
        Secure customer support
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        How can we help?
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
        Enter the email address associated with your account to securely
        access your orders and request support.
      </p>
    </div>
  );
}