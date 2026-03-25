import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: "SUPERADMIN" }
    });

    if (existingSuperAdmin) {
      return NextResponse.json({ message: "SuperAdmin already exists" }, { status: 400 });
    }

    // Upsert tenant to avoid unique constraint errors if it partially failed before
    let tenant = await prisma.tenant.findUnique({
      where: { domain: "mitienda.local" }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: "Mi Tienda Principal",
          domain: "mitienda.local",
          color: "#3b82f6" // Default blue
        }
      });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const user = await prisma.user.create({
      data: {
        email: "admin@saas.com",
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPERADMIN",
        tenantId: tenant.id
      }
    });

    return NextResponse.json({ 
      message: "SuperAdmin and Default Tenant created", 
      email: user.email, 
      password: "admin123",
      tenant: tenant.name
    });
  } catch (error: any) {
    console.error("Setup Error:", error);
    return NextResponse.json({ error: "Failed to create SuperAdmin", details: error.message }, { status: 500 });
  }
}
