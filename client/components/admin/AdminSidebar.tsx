"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  RotateCcw,
  ClipboardList,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and performance",
  },
  {
    name: "Refund Requests",
    href: "/admin/refunds",
    icon: RotateCcw,
    description: "Review refund activity",
  },
  {
    name: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ClipboardList,
    description: "System activity history",
  },
];

export default function AdminSidebar({
  mobileOpen,
  collapsed,
  onCloseMobile,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 78 : 260,
        }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen flex-col
          border-r border-slate-200/80
          bg-white
          shadow-[0_10px_40px_rgba(15,23,42,0.04)]
          lg:relative lg:z-auto lg:shadow-none

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-5">
          <Link
            href="/admin"
            onClick={onCloseMobile}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-[15px] font-semibold tracking-tight text-slate-950">
                    RefundFlow
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    Admin Console
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

         {/* Bottom admin section */}
        <div className="shrink-0 border-t border-slate-100 p-3 flex justify-between items-center">
          {!collapsed && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
                AD
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  Administrator
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  System Admin
                </p>
              </div>
            </div>
          )}

          {/* Desktop collapse */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden items-center justify-center gap-2 rounded-full p-2 text-xs font-medium text-black transition bg-gray-200 lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-3">
          <div className="mb-3 px-3">
            {!collapsed && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Workspace
              </span>
            )}
          </div>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.name : undefined}
                  className="group relative block"
                >
                  <div
                    className={`
                      relative flex items-center gap-3 rounded-xl px-3 py-2.5
                      transition-all duration-200
                      ${
                        active
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        h-[18px] w-[18px] shrink-0
                        ${
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-700"
                        }
                      `}
                    />

                    <AnimatePresence initial={false}>
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="min-w-0 overflow-hidden whitespace-nowrap"
                        >
                          <p className="text-sm font-medium">
                            {item.name}
                          </p>

                          {!active && (
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {item.description}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Active indicator */}
                  {active && !collapsed && (
                    <motion.div
                      layoutId="admin-sidebar-active"
                      className="absolute -right-[13px] top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-slate-950"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

      </motion.aside>
    </>
  );
}