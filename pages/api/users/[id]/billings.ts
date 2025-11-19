import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import type { APIBody } from "@/types/api";
import type { BillingDetail } from "@/types/billings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<BillingDetail[]>>
) {
  const { id: userId } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const result = await db`
      SELECT 
        b.billing_id,
        b.user_id,
        u.full_name,
        MAX(b.billing_status) as billing_status, 
        MAX(b.used_at) as used_at,
        json_agg(
          json_build_object(
            'serviceId', s.service_id,
            'serviceName', s.service_name,
            'price', s.price,
            'tax', s.tax,
            'description', s.description
          )
        ) as services
      FROM billings b
      JOIN users u ON b.user_id = u.user_id
      JOIN services s ON b.service_id = s.service_id
      WHERE b.user_id = ${userId as string}
      GROUP BY b.billing_id, b.user_id, u.full_name
      ORDER BY used_at DESC
    `;

    const billings: BillingDetail[] = result.map((row) => {
      const servicesList = row.services || [];

      const total = servicesList.reduce((sum: number, s: any) => {
        const price = Number(s.price);
        const tax = Number(s.tax);
        return sum + price + (price * tax / 100);
      }, 0);

      return {
        billingId: row.billingId,
        userId: row.userId,
        fullName: row.fullName,
        totalAmount: total,
        billingStatus: row.billingStatus,
        usedAt: row.usedAt ? new Date(row.usedAt) : null,
        paymentDate: null,
        
        services: servicesList.map((s: any) => ({
          serviceId: s.serviceId,    
          serviceName: s.serviceName,
          price: Number(s.price),
          tax: Number(s.tax),
          description: s.description
        }))
      };
    });

    return res.status(200).json({
      success: true,
      message: "User billings fetched successfully.",
      data: billings,
    });

  } catch (error: any) {
    console.error("Error fetching user billings:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
}