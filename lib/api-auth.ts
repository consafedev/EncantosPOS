import prisma from "@/lib/prisma";

export async function validateApiKey(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { apiKey }
  });

  return tenant;
}
