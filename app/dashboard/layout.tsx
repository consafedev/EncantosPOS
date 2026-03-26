import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import prisma from "@/lib/prisma";
import DynamicFavicon from "@/components/dynamic-favicon";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.tenantId) {
    redirect("/login");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <DynamicFavicon logoUrl={tenant?.logoUrl || undefined} />
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          {tenant?.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logoUrl} alt={tenant.name} className="h-8 w-8 object-contain" />
          )}
          <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">{tenant?.name || "SaaS Platform"}</h2>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/dashboard" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            Dashboard
          </a>
          <a href="/dashboard/inventory" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            Inventario
          </a>
          <a href="/dashboard/pos" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            Punto de Venta
          </a>
          <a href="/dashboard/marketplace" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            Marketplace
          </a>
          <a href="/dashboard/settings" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            Configuración
          </a>
          <a href={`/store/${session?.user?.tenantId}`} target="_blank" rel="noopener noreferrer" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium mt-4">
            Ver Mi Tienda ↗
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Panel de Control</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">{session.user?.email} ({session.user?.role})</span>
            <Link href="/api/auth/signout" className="text-sm text-red-600 hover:text-red-800">Cerrar Sesión</Link>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
