"use client";

import { motion } from "motion/react";
import { 
  ArrowRight, 
  CheckCircle2, 
  Store, 
  Zap, 
  Shield, 
  BarChart3, 
  Smartphone, 
  Globe,
  Facebook
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    title: "Multi-tenant Real",
    description: "Cada tienda tiene su propia base de datos aislada y personalización completa.",
    icon: Shield,
  },
  {
    title: "E-commerce Público",
    description: "Genera una URL única para que tus clientes compren sin necesidad de cuenta.",
    icon: Globe,
  },
  {
    title: "POS Offline-First",
    description: "Vende en tu tienda física incluso sin internet. Sincronización automática.",
    icon: Smartphone,
  },
  {
    title: "Marketplace Automation",
    description: "Publica tus productos en Facebook Marketplace automáticamente con un click.",
    icon: Facebook,
  },
  {
    title: "Inventario Inteligente",
    description: "Control total de stock, SKUs y generación de códigos de barras.",
    icon: BarChart3,
  },
  {
    title: "Pagos con Stripe",
    description: "Recibe pagos con tarjeta directamente en tu cuenta de Stripe Connect.",
    icon: Zap,
  }
];

const PLANS = [
  {
    name: "Gratis",
    price: "$0",
    description: "Ideal para emprendedores que están comenzando.",
    features: [
      "Hasta 10 productos",
      "1 usuario administrador",
      "Tienda online básica",
      "Soporte por comunidad"
    ],
    cta: "Empezar Gratis",
    popular: false
  },
  {
    name: "Básico",
    price: "$19",
    description: "Perfecto para pequeñas tiendas en crecimiento.",
    features: [
      "Hasta 100 productos",
      "3 usuarios",
      "POS completo",
      "Stripe Connect",
      "Soporte prioritario"
    ],
    cta: "Elegir Básico",
    popular: true
  },
  {
    name: "Pro",
    price: "$49",
    description: "Para negocios establecidos que buscan automatización.",
    features: [
      "Productos ilimitados",
      "Usuarios ilimitados",
      "FB Marketplace Automation",
      "API para n8n",
      "Soporte 24/7"
    ],
    cta: "Elegir Pro",
    popular: false
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
            <span className="text-xl font-bold tracking-tight">Encantos By Reni</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
              Iniciar Sesión
            </Link>
            <Link 
              href="#pricing" 
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Suscribirse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Gestiona tu negocio <br />
              <span className="text-blue-600">sin límites.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              La plataforma todo-en-uno para inventario, punto de venta y e-commerce. 
              Diseñada para escalar contigo desde el primer día.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="#pricing" 
                className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
              >
                Empezar ahora <ArrowRight size={20} />
              </Link>
              <Link 
                href="#features" 
                className="w-full sm:w-auto bg-slate-100 text-slate-900 px-8 py-4 rounded-full font-semibold hover:bg-slate-200 transition"
              >
                Ver funciones
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="mt-20 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="bg-slate-100 rounded-2xl p-4 shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 aspect-[16/9] flex items-center justify-center text-slate-400">
                <Store size={80} strokeWidth={1} />
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-purple-100 rounded-full blur-3xl opacity-50 -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas para vender</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hemos construido las herramientas más potentes para que tú solo te preocupes de crecer.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={i}
                className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition"
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planes que crecen contigo</h2>
            <p className="text-slate-600">Sin cargos ocultos. Cancela cuando quieras.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan, i) => (
              <div 
                key={i}
                className={`relative bg-white p-8 rounded-3xl border ${plan.popular ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-200'} flex flex-col`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    Más Popular
                  </span>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-slate-500">/mes</span>
                  </div>
                  <p className="text-slate-600 text-sm">{plan.description}</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/register"
                  className={`w-full py-4 rounded-xl font-bold transition text-center ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">E</div>
            <span className="font-bold">Encantos By Reni</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="#" className="hover:text-blue-600 transition">Términos</Link>
            <Link href="#" className="hover:text-blue-600 transition">Privacidad</Link>
            <Link href="#" className="hover:text-blue-600 transition">Contacto</Link>
          </div>
          <p className="text-sm text-slate-400">© 2026 Encantos By Reni. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
