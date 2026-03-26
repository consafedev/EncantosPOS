"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type LocalProduct } from "@/lib/db";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Barcode, 
  RefreshCw, 
  Banknote, 
  CreditCard,
  XCircle,
  CheckCircle2,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function POSPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'POS' | 'HISTORY' | 'CASH'>('POS');
  const [cashAmount, setCashAmount] = useState("");
  const [cashReason, setCashReason] = useState("");

  // Queries
  const products = useLiveQuery(
    () => db.products.where("tenantId").equals(session?.user?.tenantId || "").toArray(),
    [session?.user?.tenantId]
  );

  const localOrders = useLiveQuery(
    () => db.orders.where("tenantId").equals(session?.user?.tenantId || "").reverse().toArray(),
    [session?.user?.tenantId]
  );

  const cashEntries = useLiveQuery(
    () => db.cashEntries.where("tenantId").equals(session?.user?.tenantId || "").reverse().toArray(),
    [session?.user?.tenantId]
  );

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.includes(search)
  ) || [];

  const syncOrders = async () => {
    if (!session?.user?.tenantId) return;
    const unsynced = localOrders?.filter(o => !o.synced) || [];
    if (unsynced.length === 0) return;

    setSyncing(true);
    try {
      const res = await fetch("/api/pos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: unsynced })
      });

      if (res.ok) {
        const { processedIds } = await res.json();
        await db.orders.bulkUpdate(processedIds.map((id: number) => ({
          key: id,
          changes: { synced: true }
        })));
        alert("Sincronización exitosa");
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleCashEntry = async (type: 'IN' | 'OUT' | 'OPEN' | 'CLOSE') => {
    if (!cashAmount || !session?.user?.tenantId) return;
    
    await db.cashEntries.add({
      type,
      amount: parseFloat(cashAmount),
      reason: cashReason,
      createdAt: Date.now(),
      tenantId: session.user.tenantId
    });

    setCashAmount("");
    setCashReason("");
    alert(`Entrada de caja (${type}) registrada`);
  };

  const handleBarcodeScan = async (code: string) => {
    if (activeTab !== 'POS') return;
    const product = products?.find(p => p.barcode === code || p.sku === code);
    if (product) {
      addToCart(product);
    }
  };

  const syncProducts = async () => {
    if (!session?.user?.tenantId) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        await db.products.bulkPut(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          sku: p.sku,
          barcode: p.barcode,
          stock: p.stock,
          tenantId: p.tenantId
        })));
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const addToCart = (product: LocalProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const order = {
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total,
      paymentMethod,
      createdAt: Date.now(),
      synced: false,
      tenantId: session?.user?.tenantId || ""
    };

    await db.orders.add(order);
    setCart([]);
    setShowCheckout(false);
    alert("Venta realizada con éxito (Guardada localmente)");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-6 overflow-hidden">
      {/* Tabs & Top Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('POS')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'POS' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <ShoppingCart size={18} />
            POS
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'HISTORY' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <History size={18} />
            Historial
          </button>
          <button 
            onClick={() => setActiveTab('CASH')}
            className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'CASH' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <Banknote size={18} />
            Caja
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={syncOrders}
            disabled={syncing || !localOrders?.some(o => !o.synced)}
            className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
            Sincronizar Ventas
          </button>
          <button 
            onClick={syncProducts}
            disabled={syncing}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw size={20} className={syncing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {activeTab === 'POS' ? (
          <>
            {/* Left: Product Selection */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre, SKU o código de barras..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
                {filteredProducts.map(product => (
                  <motion.button
                    key={product.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product)}
                    className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-left hover:border-blue-500 transition group"
                  >
                    <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{product.sku}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold">${product.price.toFixed(2)}</span>
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:bg-blue-500 group-hover:text-white transition">
                        <Plus size={16} />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Right: Cart */}
            <div className="w-96 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <ShoppingCart size={20} />
                  <span>Carrito</span>
                </div>
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {cart.length} items
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div 
                      key={item.product.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{item.product.name}</div>
                        <div className="text-xs text-gray-500">${item.product.price.toFixed(2)} c/u</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:text-blue-600 transition"><Minus size={14} /></button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:text-blue-600 transition"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => updateQuantity(item.product.id, -item.quantity)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 size={16} /></button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <Barcode size={48} strokeWidth={1} />
                    <p className="text-sm">Escanea un producto o búscalo arriba</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50"
                >
                  Pagar Ahora
                </button>
              </div>
            </div>
          </>
        ) : activeTab === 'HISTORY' ? (
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white">
              Historial de Ventas Locales
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Pago</th>
                    <th className="px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {localOrders?.map(order => (
                    <tr key={order.id} className="text-sm">
                      <td className="px-6 py-4 font-mono">#{order.id}</td>
                      <td className="px-6 py-4">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 font-bold">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">{order.paymentMethod}</td>
                      <td className="px-6 py-4">
                        {order.synced ? (
                          <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={14} /> Sincronizado</span>
                        ) : (
                          <span className="text-orange-600 flex items-center gap-1"><RefreshCw size={14} /> Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Cash Entry Form */}
            <div className="w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Movimiento de Caja</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                  <input 
                    type="number" 
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo</label>
                  <input 
                    type="text" 
                    value={cashReason}
                    onChange={(e) => setCashReason(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej. Apertura, Pago a proveedor..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button onClick={() => handleCashEntry('IN')} className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">Entrada</button>
                  <button onClick={() => handleCashEntry('OUT')} className="bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">Salida</button>
                  <button onClick={() => handleCashEntry('OPEN')} className="col-span-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">Apertura de Caja</button>
                </div>
              </div>
            </div>

            {/* Cash History */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-gray-900 dark:text-white">
                Historial de Caja
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Monto</th>
                      <th className="px-6 py-3">Motivo</th>
                      <th className="px-6 py-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cashEntries?.map(entry => (
                      <tr key={entry.id} className="text-sm">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            entry.type === 'IN' || entry.type === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold">${entry.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">{entry.reason}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(entry.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Finalizar Venta</h3>
                <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Total a Pagar</div>
                  <div className="text-5xl font-black text-blue-600">${total.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 ${
                      paymentMethod === 'CASH' 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                        : 'border-gray-200 dark:border-gray-700 text-gray-500'
                    }`}
                  >
                    <Banknote size={32} />
                    <span className="font-bold">Efectivo</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-4 rounded-2xl border-2 transition flex flex-col items-center gap-2 ${
                      paymentMethod === 'CARD' 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                        : 'border-gray-200 dark:border-gray-700 text-gray-500'
                    }`}
                  >
                    <CreditCard size={32} />
                    <span className="font-bold">Tarjeta</span>
                  </button>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Confirmar Pago
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
