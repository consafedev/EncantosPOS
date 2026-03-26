"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface MarketplaceJob {
  id: string;
  status: string;
  error: string | null;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };
}

export default function MarketplacePage() {
  const [jobs, setJobs] = useState<MarketplaceJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/marketplace/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Error fetching jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="text-green-500" size={18} />;
      case "FAILED": return <AlertCircle className="text-red-500" size={18} />;
      case "PROCESSING": return <RefreshCw className="text-blue-500 animate-spin" size={18} />;
      default: return <Clock className="text-gray-400" size={18} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED": return "Completado";
      case "FAILED": return "Fallido";
      case "PROCESSING": return "Procesando";
      default: return "Pendiente";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <ShoppingBag /> Automatización Marketplace
        </h2>
        <button 
          onClick={fetchJobs}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {jobs.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                  No hay publicaciones registradas. Usa n8n para encolar productos.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{job.product.name}</div>
                    <div className="text-xs text-gray-500">SKU: {job.product.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="text-sm">{getStatusText(job.status)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {job.error ? (
                      <span className="text-red-500 truncate max-w-xs block" title={job.error}>
                        {job.error}
                      </span>
                    ) : (
                      <span className="text-gray-400">Sin errores</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">¿Cómo funciona?</h3>
        <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
          Este sistema encola las publicaciones para que un bot (Playwright) las procese de forma segura en tu servidor.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
            <div className="font-bold text-blue-600 mb-1">1. n8n</div>
            <p className="text-xs text-gray-500">n8n llama a la API externa con tu API Key y el ID del producto.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
            <div className="font-bold text-blue-600 mb-1">2. Cola (Redis)</div>
            <p className="text-xs text-gray-500">La publicación se guarda en una cola para evitar bloqueos de Facebook.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
            <div className="font-bold text-blue-600 mb-1">3. Bot (Playwright)</div>
            <p className="text-xs text-gray-500">El bot abre un navegador, inicia sesión y publica el producto.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
