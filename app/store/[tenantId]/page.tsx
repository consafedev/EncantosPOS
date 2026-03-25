"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useState, useEffect } from "react";

export default function StorePage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { items, addItem } = useCart();
  const [tenantId, setTenantId] = useState<string>("");
  const [tenant, setTenant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => {
      setTenantId(p.tenantId);
      fetch(`/api/store/${p.tenantId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            // handle error
          } else {
            setTenant(data.tenant);
            setProducts(data.products);
          }
          setLoading(false);
        });
    });
  }, [params]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!tenant) return <div className="min-h-screen flex items-center justify-center">Tienda no encontrada</div>;

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--theme-color': tenant.color || '#3b82f6' } as React.CSSProperties}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {tenant.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logoUrl} alt={tenant.name} className="h-8 object-contain" />
            )}
            <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/store/${tenantId}/cart`} className="p-2 text-gray-600 hover:text-[var(--theme-color)] transition relative">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Banner */}
      <div className="bg-[var(--theme-color)] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Bienvenido a {tenant.name}</h2>
          <p className="mt-4 text-lg opacity-90">Descubre nuestros productos de alta calidad.</p>
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition flex flex-col">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 w-full h-48 flex items-center justify-center text-gray-400">
                {/* Placeholder for product image */}
                <span>Sin Imagen</span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-[var(--theme-color)]">${product.price.toFixed(2)}</span>
                  <button 
                    onClick={() => addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      tenantId: tenant.id
                    })}
                    className="bg-[var(--theme-color)] text-white px-3 py-1.5 rounded text-sm font-medium hover:opacity-90 transition"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No hay productos disponibles en este momento.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
