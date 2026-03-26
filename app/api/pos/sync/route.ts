import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orders } = await req.json();

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: "Invalid orders data" }, { status: 400 });
    }

    // Process orders in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const processedIds: string[] = [];

      for (const order of orders) {
        // Create order record
        const newOrder = await tx.order.create({
          data: {
            tenantId: session.user.tenantId,
            total: order.total,
            status: "COMPLETED",
            paymentMethod: order.paymentMethod,
            items: {
              create: order.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        });

        // Update stock for each product
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }

        processedIds.push(order.id); // This is the local ID from Dexie
      }

      return processedIds;
    });

    return NextResponse.json({ success: true, processedIds: results });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Failed to sync orders" }, { status: 500 });
  }
}
