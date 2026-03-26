import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const tenant = await validateApiKey(req);

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
