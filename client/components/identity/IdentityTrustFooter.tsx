import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function IdentityTrustFooter() {
  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <div className="flex flex-col items-center justify-center gap-4 text-xs text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-4 w-4" />
          Secure connection
        </div>

        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Your information is protected
        </div>
      </div>
    </div>
  );
}