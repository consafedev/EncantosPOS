import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as any;
      
      // We can retrieve line items to update inventory
      try {
        const stripe = getStripe();
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          stripeAccount: session.stripe_account || undefined
        });

        // This is a simplified inventory update. In a real app, you'd want to store the product ID in metadata
        // or use Stripe Products directly linked to your DB.
        // For now, we'll just log it as a successful order.
        console.log("Payment successful for session:", session.id);
        console.log("Items purchased:", lineItems.data.length);
        
        // Example: Create an order record
        // await prisma.order.create({ ... })
        
      } catch (error) {
        console.error("Error processing successful checkout:", error);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
