import type { NextApiRequest, NextApiResponse } from "next"
import { promises as fs } from "fs"
import { createReadStream } from "fs"
import path from "path"
import os from "os"
import { db } from "@/db"
import type { BillingDetail, BillingService } from "@/types/billings"
import type { APIBody } from "@/types/api"

type BillingFileDetail = BillingDetail & {
  file: string
}

type BillingResponse = APIBody<BillingFileDetail>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BillingResponse | Uint8Array>
) {
  const { id } = req.query

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Billing ID is required",
    })
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`,
    })
  }

  try {
    const rows = await db<{
      billingId: string
      userId: string
      fullName: string
      serviceId: number
      serviceName: string
      price: number
      description: string | null
      tax: number
      billingStatus: string
      dueDate: string
      periodStart: string
      periodEnd: string
      paidAt: string | null
    }[]>`
      SELECT 
        b.billing_id,
        b.user_id,
        u.full_name,
        s.service_id,
        s.service_name,
        s.price,
        s.description,
        s.tax,
        b.billing_status,
        b.due_date,
        b.period_start,
        b.period_end,
        b.paid_at
      FROM billings b
      JOIN users u ON u.user_id = b.user_id
      JOIN services s ON s.service_id = b.service_id
      WHERE b.billing_id = ${id};
    `

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No billings found for this billing ID",
      })
    }

    const userInfo = rows[0]

    const services: BillingService[] = rows.map((row: (typeof rows)[number]) => ({
      serviceId: row.serviceId,
      serviceName: row.serviceName,
      price: Number(row.price),
      description: row.description,
      tax: Number(row.tax),
    }))

    const totalPrice = services.reduce((sum, service) => {
      const taxAmount = (service.price * service.tax) / 100
      return sum + service.price + taxAmount
    }, 0)

    const billing: BillingDetail = {
      billingId: userInfo.billingId,
      userId: userInfo.userId,
      fullName: userInfo.fullName,
      services,
      totalPrice,
      billingStatus: userInfo.billingStatus as BillingDetail["billingStatus"],
      dueDate: userInfo.dueDate,
      periodStart: userInfo.periodStart,
      periodEnd: userInfo.periodEnd,
      paidAt: userInfo.paidAt,
    }

    const tmpFileName = `invoice-${billing.userId}-${Date.now()}.pdf`
    const tmpFilePath = path.join(os.tmpdir(), tmpFileName)

    const invoiceDate = new Date()
    const dueDate = billing.dueDate ? new Date(billing.dueDate) : new Date(invoiceDate)

    const invoicePayload = {
      company: {
        name: "Apartment Management",
      },
      customer: {
        name: billing.fullName,
      },
      invoice: {
        number: billing.billingId,
        date: invoiceDate.toISOString().slice(0, 10),
        dueDate: dueDate.toISOString().slice(0, 10),
        status: billing.billingStatus.toUpperCase(),
        path: tmpFilePath,
        currency: "USD",
        locale: "en-US",
      },
      items: billing.services.map((s) => ({
        name: s.serviceName,
        description: s.description ?? "",
        quantity: 1,
        price: s.price,
        tax: s.tax,
      })),
      qr: {
        data: billing.billingId,
      },
      note: "Thank you for your payment.",
    }

    const { PDFInvoice } = await import("@h1dd3nsn1p3r/pdf-invoice")
    const invoice = new PDFInvoice(invoicePayload)
    const generatedPath = await invoice.create()
    
    // Collect the PDF stream properly into a buffer
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      const stream = createReadStream(generatedPath)
      
      stream.on("data", (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })
      stream.on("end", () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer)
      })
      stream.on("error", (err) => reject(err))
    })
    
    await fs.unlink(generatedPath).catch(() => {})
    const fileBase64 = pdfBuffer.toString("base64")

    const payload: BillingFileDetail = {
      ...billing,
      file: fileBase64,
    }

    return res.status(200).json({
      success: true,
      message: "Billing PDF generated",
      data: payload,
    })
  } catch (error) {
    console.error("Error generating billing PDF:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to generate billing PDF",
    })
  }
}
