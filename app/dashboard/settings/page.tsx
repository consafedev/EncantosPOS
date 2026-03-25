"use client";

import { useState, useEffect } from "react";
import { Save, ExternalLink } from "lucide-react";

const PREDEFINED_COLORS = [
  { name: "Azul (Default)", value: "#3b82f6" },
  { name: "Esmeralda", value: "#10b981" },
  { name: "Violeta", value: "#8b5cf6" },
  { name: "Rosa", value: "#f43f5e" },
  { name: "Pizarra", value: "#64748b" },
  { name: "Naranja", value: "#f97316" }
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    logoUrl: "",
    stripeAccountId: ""
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            color: data.color || "#3b82f6",
            logoUrl: data.logoUrl || "",
            stripeAccountId: data.stripeAccountId || ""
          });
        }
      } catch (err) {
        console.error("Error fetching settings", err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleStripeConnect = async () => {
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        const err = await res.json();
        setMessage(`Error conectando con Stripe: ${err.error}`);
      }
    } catch (err) {
      setMessage("Error de red al conectar con Stripe");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage("Configuración guardada exitosamente. Recarga la página para ver los cambios en el tema.");
      } else {
        setMessage("Error al guardar la configuración");
      }
    } catch (err) {
      setMessage("Error de red al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center">Cargando configuración...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Configuración de la Tienda</h2>

      {message && (
        <div className={`p-4 rounded mb-6 ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Tienda</label>
            <input 
              type="text" 
              name="name" 
              required 
              value={formData.name} 
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Principal (Tema)</label>
            <div className="flex items-center gap-4">
              <select 
                name="color" 
                value={formData.color} 
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {PREDEFINED_COLORS.map(c => (
                  <option key={c.value} value={c.value}>{c.name}</option>
                ))}
              </select>
              <div className="w-10 h-10 rounded border" style={{ backgroundColor: formData.color }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Este color se aplicará a los botones y elementos principales de la tienda.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL del Logo</label>
            <input 
              type="url" 
              name="logoUrl" 
              placeholder="https://ejemplo.com/logo.png"
              value={formData.logoUrl} 
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Sube tu logo al NAS y pega aquí la URL pública. Se usará también como Favicon.</p>
            {formData.logoUrl && (
              <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-900 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.logoUrl} alt="Logo Preview" className="max-h-20 object-contain" />
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Integración de Pagos</h3>
            <div className="flex items-center justify-between p-4 border rounded bg-gray-50 dark:bg-gray-900">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Stripe Connect</p>
                <p className="text-sm text-gray-500">
                  {formData.stripeAccountId 
                    ? "Tu cuenta está conectada. Puedes recibir pagos." 
                    : "Conecta tu cuenta de Stripe para recibir pagos en el e-commerce."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleStripeConnect}
                className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                  formData.stripeAccountId 
                    ? "bg-green-100 text-green-700 hover:bg-green-200" 
                    : "bg-[#635BFF] text-white hover:bg-[#4B45D6]"
                }`}
              >
                {formData.stripeAccountId ? "Configurar Cuenta" : "Conectar Stripe"}
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center gap-2 transition disabled:opacity-50"
            style={{ backgroundColor: formData.color }}
          >
            <Save size={20} />
            {loading ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}
