import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    let accountId = tenant.stripeAccountId;

    if (!accountId) {
      // Create a new Stripe connected account
      const account = await stripe.accounts.create({
        type: 'standard',
        country: process.env.STRIPE_CONNECT_ACCOUNT_COUNTRY || 'US',
        email: session.user.email || undefined,
      });
      
      accountId = account.id;

      // Save the account ID to the tenant
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { stripeAccountId: accountId }
      });
    }

    // Create an account link for onboarding
    const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/settings?stripe_refresh=true`,
      return_url: `${origin}/dashboard/settings?stripe_return=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Stripe connect error:", error);
    return NextResponse.json({ error: error.message || "Failed to connect to Stripe" }, { status: 500 });
  }
}
