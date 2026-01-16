"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Overview" },
  { href: "/schools", label: "Schools" },
  { href: "/risks", label: "Risks & Alerts" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-gradient-to-r from-green-700 to-green-800 shadow-md">
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 flex items-center justify-center bg-white rounded-full p-1 shadow-sm">
                <Image
                  src="/ministry-logo.jpg"
                  alt="Federal Ministry of Education Logo"
                  width={56}
                  height={56}
                  className="object-contain rounded-full"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white leading-tight">
                  Federal Ministry of Education
                </h1>
                <p className="text-xs text-white/90 leading-tight">
                  Unity Schools Executive Dashboard
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-md",
                    isActive
                      ? "bg-white text-green-800 shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
