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
    <div className="min-h-screen flex bg-green-50">
      <aside className="w-60 bg-emerald-100 text-emerald-900 p-5 flex flex-col print:hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-200 flex items-center justify-center">
            <Croissant size={22} />
          </div>
          <div>
            <div className="font-bold leading-tight">Toko Roti</div>
            <div className="text-xs text-emerald-700">Admin: {session.nama}</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-emerald-200"
              >
                <Icon size={18} />
                {m.label}
              </Link>
            );
          })}
        </nav>

        <form action="/api/logout" method="POST">
          <button
            type="submit"
            className="w-full bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 py-2 rounded-xl flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </form>
      </aside>

      <main className="flex-1 p-8 text-gray-800 print:p-0">{children}</main>
    </div>
  );
}