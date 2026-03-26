import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright-core";

const prisma = new PrismaClient();

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker("marketplace-publications", async (job) => {
  const { jobId, productId, tenantId, productName, productDescription, productPrice, productImageUrl } = job.data;

  // Update DB to PROCESSING
  await prisma.marketplaceJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING" }
  });

  try {
    // Playwright logic here
    const browser = await chromium.launch({ 
      headless: true,
      executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome"
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    // FB Login (using env vars)
    await page.goto("https://www.facebook.com/login");
    await page.fill("#email", process.env.FB_EMAIL!);
    await page.fill("#pass", process.env.FB_PASSWORD!);
    await page.click('button[name="login"]');
    
    // Wait for login
    await page.waitForURL("https://www.facebook.com/", { timeout: 60000 });

    // Go to Marketplace create listing
    await page.goto("https://www.facebook.com/marketplace/create/item");

    // Fill listing details
    // (This is a simplified example, FB selectors change often)
    // ... fill title, price, category, description, upload image ...

    await browser.close();

    // Update DB to COMPLETED
    await prisma.marketplaceJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED" }
    });
  } catch (error: any) {
    console.error("Marketplace worker error:", error);
    // Update DB to FAILED
    await prisma.marketplaceJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: error.message }
    });
    throw error;
  }
}, { connection });

console.log("Marketplace worker started...");
