import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db"; 
import type { APIBody } from "@/types/api"; 
import type { VehicleLog } from "@/types/vehicles"; 

type ResponseData = {
  logs: VehicleLog[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIBody<ResponseData>> 
) {
  // 2. Chỉ chấp nhận GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    });
  }

  try {
    const { userId, filter } = req.query;
    const baseQuery = db`
      SELECT 
        u.user_id, 
        u.full_name, 
        v.vehicle_id, 
        v.license_plate, 
        vl.entrance_time, 
        vl.exit_time
      FROM 
        vehicle_logs vl
      JOIN 
        vehicles v ON vl.vehicle_id = v.vehicle_id
      JOIN 
        users u ON v.user_id = u.user_id
    `;

    const whereClauses = [];
    if (userId) {
      whereClauses.push(db`u.user_id = ${userId as string}`);
    }

    if (filter === 'week') {
      whereClauses.push(db`vl.entrance_time >= NOW() - '7 days'::interval`);
    } else if (filter === 'month') {
      whereClauses.push(db`vl.entrance_time >= NOW() - '1 month'::interval`);
    } else if (filter === 'year') {
      whereClauses.push(db`vl.entrance_time >= NOW() - '1 year'::interval`);
    }

    const sortQuery = db`ORDER BY vl.entrance_time asc`;

    let finalQuery;
    
    if (whereClauses.length > 0) {
      const combinedWhere = whereClauses.reduce((prev, curr) => db`${prev} AND ${curr}`);
      finalQuery = db`${baseQuery} WHERE ${combinedWhere} ${sortQuery}`;
    } else {
      finalQuery = db`${baseQuery} ${sortQuery}`;
    }

    const rawLogs = await finalQuery;

    const logs: VehicleLog[] = rawLogs.map((row: any) => ({
      userId: row.user_id,
      fullName: row.full_name,
      vehicleId: row.vehicle_id,
      licensePlate: row.license_plate,
      entranceTime: row.entrance_time,
      exitTime: row.exit_time,
    }));

    return res.status(200).json({
      success: true,
      message: "Fetched vehicle logs successfully.",
      data: {
        logs,
      },
    });

  } catch (error) {
    console.error("Error fetching vehicle logs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}