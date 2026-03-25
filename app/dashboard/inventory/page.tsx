"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Printer, Edit, Trash2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  stock: number;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Inventario</h2>
        <Link 
          href="/dashboard/inventory/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
        >
          <Plus size={20} />
          Nuevo Producto
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Código Barras</th>
                <th className="p-4 font-medium">Precio</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">Cargando...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">No hay productos en el inventario.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="p-4 text-gray-800 dark:text-gray-200">{product.name}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{product.sku}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 font-mono text-sm">{product.barcode}</td>
                    <td className="p-4 text-gray-800 dark:text-gray-200">${product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <Link href={`/dashboard/inventory/print/${product.id}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Imprimir Etiqueta">
                        <Printer size={18} />
                      </Link>
                      <Link href={`/dashboard/inventory/edit/${product.id}`} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition" title="Editar">
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={async () => {
                          if (confirm("¿Estás seguro de eliminar este producto?")) {
                            await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
                            fetchProducts();
                          }
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition" 
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
