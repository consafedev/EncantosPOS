import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiKey = `sk_${randomBytes(24).toString("hex")}`;
    
    const tenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: { apiKey }
    });

    return NextResponse.json({ apiKey: tenant.apiKey });
  } catch (error) {
    console.error("Error generating API Key:", error);
    return NextResponse.json({ error: "Failed to generate API Key" }, { status: 500 });
  }
}
