"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Sprout,
  Activity,
  FlaskConical,
  Droplets,
  History,
  TriangleAlert,
  FileText,
  Leaf,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Crop Setup",
    href: "/crop-setup",
    icon: Sprout,
  },
  {
    name: "Soil Monitoring",
    href: "/soil-monitoring",
    icon: Activity,
  },
  {
    name: "Fertilizer",
    href: "/fertilizer",
    icon: FlaskConical,
  },
  {
    name: "Irrigation",
    href: "/irrigation",
    icon: Droplets,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: TriangleAlert,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Leaf size={22} />
        </div>

        <div>
          <h1 className="font-bold text-slate-900">
            AgroSense
          </h1>

          <p className="text-xs text-slate-500">
            Smart Soil System
          </p>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={19} />

              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}