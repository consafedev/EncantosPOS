import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import prisma from "@/lib/prisma";
import { marketplaceQueue } from "@/lib/queue";

export async function POST(req: Request) {
  const tenant = await validateApiKey(req);

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, tenantId: tenant.id }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create a job record in the DB
    const marketplaceJob = await prisma.marketplaceJob.create({
      data: {
        productId,
        tenantId: tenant.id,
        status: "PENDING"
      }
    });

    // Enqueue the job in BullMQ
    const job = await marketplaceQueue.add("publish-to-marketplace", {
      jobId: marketplaceJob.id,
      productId: product.id,
      tenantId: tenant.id,
      productName: product.name,
      productDescription: product.description,
      productPrice: product.price,
      productImageUrl: product.imageUrl
    });

    // Update the job record with the BullMQ job ID
    await prisma.marketplaceJob.update({
      where: { id: marketplaceJob.id },
      data: { jobId: job.id }
    });

    return NextResponse.json({ 
      success: true, 
      marketplaceJobId: marketplaceJob.id,
      jobId: job.id 
    });
  } catch (error) {
    console.error("Error enqueuing marketplace job:", error);
    return NextResponse.json({ error: "Failed to enqueue job" }, { status: 500 });
  }
}
