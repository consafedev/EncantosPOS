import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, sku, price, cost, stock, barcode } = body;

    // Basic validation
    if (!name || !price || !cost) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Auto-generate SKU if not provided
    const finalSku = sku || `SKU-${Date.now()}`;
    
    // Auto-generate Barcode (EAN-13 format dummy) if not provided
    // A real EAN-13 requires a checksum, for now we use a 12-digit timestamp + random digit
    const finalBarcode = barcode || `${Date.now()}${Math.floor(Math.random() * 10)}`;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku: finalSku,
        barcode: finalBarcode,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock) || 0,
        tenantId: session.user.tenantId
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "SKU or Barcode already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
