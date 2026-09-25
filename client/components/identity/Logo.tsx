import { ShieldCheck } from "lucide-react";

export default function CSRSLogo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950">
        <ShieldCheck className="h-5 w-5 text-white" />
      </div>

      <span className="text-lg font-semibold tracking-tight text-slate-950">
        Customer Support Refund System
      </span>
    </div>
  );
}