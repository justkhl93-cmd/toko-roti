import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Croissant,
  LayoutDashboard,
  Package,
  Users,
  UserCog,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/kasir");

  const menu = [
    { href: "/admin", label: "Beranda", icon: LayoutDashboard },
    { href: "/admin/barang", label: "Produk", icon: Package },
    { href: "/admin/member", label: "Member", icon: Users },
    { href: "/admin/petugas", label: "Petugas", icon: UserCog },
    { href: "/admin/laporan", label: "Laporan", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-green-50">
      <aside className="w-full md:w-60 md:shrink-0 bg-emerald-100 text-emerald-900 p-4 md:p-5 flex flex-col print:hidden">
        <div className="flex items-center justify-between gap-3 mb-3 md:mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-200 flex items-center justify-center">
              <Croissant size={22} />
            </div>
            <div className="min-w-0">
              <div className="font-bold leading-tight">Toko Roti</div>
              <div className="text-xs text-emerald-700 truncate">
                Admin: {session.nama}
              </div>
            </div>
          </div>

          <form action="/api/logout" method="POST" className="md:hidden">
            <button
              type="submit"
              className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl flex items-center gap-2 text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </form>
        </div>

        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible md:flex-1 pb-1 md:pb-0">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="flex items-center gap-2 md:gap-3 px-3 py-2 rounded-xl hover:bg-emerald-200 whitespace-nowrap shrink-0"
              >
                <Icon size={18} />
                {m.label}
              </Link>
            );
          })}
        </nav>

        <form action="/api/logout" method="POST" className="hidden md:block">
          <button
            type="submit"
            className="w-full bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 py-2 rounded-xl flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8 text-gray-800 print:p-0">
        {children}
      </main>
    </div>
  );
}