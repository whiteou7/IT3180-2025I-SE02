import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import type { APIBody } from "@/types/api";
import { randomUUID } from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<{ billingId: string } | null>>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { userId, serviceIds } = req.body as { userId: string; serviceIds: number[] };

  if (!userId || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "userId and serviceIds (non-empty array) are required" 
    });
  }

  try {
    const newBillingId = await db.begin(async (sql) => {
      const billingId = randomUUID();
      const services = await sql`
        SELECT service_id FROM services WHERE service_id IN ${sql(serviceIds)}
      `;

      if (services.length !== serviceIds.length) {
        throw new Error("One or more services are invalid.");
      }

      const billingRecords = serviceIds.map(sid => ({
        billing_id: billingId,
        user_id: userId,
        service_id: sid,
        billing_status: 'unpaid',
        used_at: new Date()
      }));

      await sql`
        INSERT INTO billings ${sql(billingRecords)}
      `;

      return billingId;
    });

    return res.status(201).json({
      success: true,
      message: "Billing created successfully.",
      data: { billingId: newBillingId },
    });

  } catch (error: any) {
    console.error("Error creating billing:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
}