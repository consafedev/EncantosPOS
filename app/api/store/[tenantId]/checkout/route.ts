import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  try {
    const stripe = getStripe();
    const { tenantId } = await params;
    const body = await req.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant || !tenant.stripeAccountId) {
      return NextResponse.json({ error: "Store not configured for payments" }, { status: 400 });
    }

    // Verify products and prices from database
    const productIds = items.map((item: any) => item.id);
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        tenantId: tenant.id
      }
    });

    const lineItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.id);
      if (!product) throw new Error(`Product ${item.id} not found`);
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description || undefined,
          },
          unit_amount: Math.round(product.price * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Create Stripe Checkout session on behalf of the connected account
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/store/${tenantId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store/${tenantId}/cart`,
      payment_intent_data: {
        application_fee_amount: 0, // You can take a platform fee here if desired
      },
    }, {
      stripeAccount: tenant.stripeAccountId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
