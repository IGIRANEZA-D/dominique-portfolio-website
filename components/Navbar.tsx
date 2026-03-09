"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/experiences", label: "Experiences" },
  { href: "/skills", label: "Skills" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[rgba(10,15,19,0.94)] backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] w-full max-w-[1700px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-0.5 whitespace-nowrap text-xl font-extrabold tracking-[0.04em] text-white"
          aria-label="Go to Home"
        >
          <span className="text-[#c04e1d]">D</span>ominique
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative py-2 text-sm font-semibold transition-colors ${
                pathname === item.href ? "text-[#c04e1d]" : "text-slate-100 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-white/15 p-2 text-slate-100 transition-colors hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-primary-nav"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav id="mobile-primary-nav" aria-label="Mobile primary" className="border-t border-white/10 bg-[#0a0f13] md:hidden">
          <div className="mx-auto flex w-full max-w-[1700px] flex-col px-4 py-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={`mobile-${item.href}`}
                href={item.href}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  pathname === item.href ? "bg-[#c04e1d]/20 text-[#f6b799]" : "text-slate-100 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
