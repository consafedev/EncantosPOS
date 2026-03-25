"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function SuccessPage({ params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = use(params);
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart when payment is successful
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-green-500 w-20 h-20" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-8">
          Tu pedido ha sido procesado correctamente. Recibirás un correo de confirmación en breve.
        </p>
        <Link 
          href={`/store/${tenantId}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-block w-full"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
