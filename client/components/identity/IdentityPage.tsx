import IdentityHeader from "./IdentityHeader";
import IdentityForm from "./IdentityForm";
import IdentityTrustFooter from "./IdentityTrustFooter";
import RefundFlowLogo from "./Logo";

export default function IdentityPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-50">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[-180px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-slate-200/50 blur-3xl" />

                <div className="absolute bottom-[-200px] left-[-100px] h-[400px] w-[400px] rounded-full bg-slate-200/40 blur-3xl" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-6">
                <div className="w-full max-w-md space-y-6">
                    <RefundFlowLogo />
                    <IdentityHeader />

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.25)] sm:p-8">
                        <IdentityForm />

                        <IdentityTrustFooter />
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        Powered by RefundFlow
                    </p>
                </div>
            </div>
        </main>
    );
}