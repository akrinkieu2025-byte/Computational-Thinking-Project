"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, BarChart3, BookOpen } from "lucide-react";
import IECareLogo from "./IECareLogo";

const links = [
  { href: "/", label: "Optimizer", icon: Activity },
  { href: "/sensitivity", label: "Sensitivity", icon: BarChart3 },
  { href: "/explanation", label: "Methodology", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#090b12]/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-14">
        <Link href="/" className="flex items-center">
          <IECareLogo size="sm" />
        </Link>

        <div className="flex gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "text-white bg-white/[0.06]"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                }`}
              >
                <Icon size={13} strokeWidth={2} />
                <span>{link.label}</span>
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-[9px] h-[1.5px] bg-blue-400/80"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
