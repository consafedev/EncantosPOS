"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Barcode from "react-barcode";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
};

export default function PrintBarcodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Cargando etiqueta...</div>;
  if (!product) return <div className="p-8 text-center text-red-500">Producto no encontrado</div>;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Controles (Ocultos al imprimir) */}
      <div className="print:hidden mb-8 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <Link href="/dashboard/inventory" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-2 transition">
          <ArrowLeft size={20} /> Volver al Inventario
        </Link>
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
        >
          <Printer size={20} /> Imprimir Etiqueta
        </button>
      </div>

      {/* Área de Impresión (Diseñada para impresora térmica de 58mm/80mm) */}
      <div className="flex justify-center">
        <div className="bg-white p-4 border border-dashed border-gray-400 print:border-none print:p-0 flex flex-col items-center justify-center" style={{ width: '58mm', minHeight: '40mm' }}>
          <div className="text-center w-full">
            <h3 className="font-bold text-sm text-black truncate w-full px-1">{product.name}</h3>
            <p className="text-xs text-gray-600 mb-1">SKU: {product.sku}</p>
            
            <div className="flex justify-center w-full my-1">
              {product.barcode ? (
                <Barcode 
                  value={product.barcode} 
                  format="CODE128"
                  width={1.5} 
                  height={40} 
                  fontSize={12}
                  margin={0}
                  displayValue={true}
                />
              ) : (
                <div className="h-10 border border-gray-300 flex items-center justify-center text-xs text-gray-400 w-full">
                  Sin código
                </div>
              )}
            </div>
            
            <p className="font-bold text-lg text-black mt-1">${product.price.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          /* El contenedor de la etiqueta y sus hijos sí se ven */
          .flex.justify-center > div, .flex.justify-center > div * {
            visibility: visible;
          }
          .flex.justify-center > div {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
