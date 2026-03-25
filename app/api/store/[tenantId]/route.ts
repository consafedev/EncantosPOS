import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  try {
    const { tenantId } = await params;
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { 
        tenantId: tenant.id,
        stock: { gt: 0 }
      }
    });

    return NextResponse.json({ tenant, products });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch store data" }, { status: 500 });
  }
}
