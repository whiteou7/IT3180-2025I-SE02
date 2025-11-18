declare module "pdf-invoice" {
  // Minimal typings for the pdf-invoice library used in the project.
  // Extend this as needed to match the library's actual API.

  export interface PdfInvoiceItem {
    name: string
    description?: string
    qty: number
    price: number
    tax?: number
  }

  export interface PdfInvoicePayload {
    company?: {
      name?: string
      address?: string
      phone?: string
      email?: string
    }
    customer?: {
      name?: string
      id?: string
      address?: string
      phone?: string
      email?: string
    }
    invoice?: {
      number?: string
      date?: string
    }
    items: PdfInvoiceItem[]
    totals?: {
      total?: number
    }
    [key: string]: unknown
  }

  export function createInvoice(payload: PdfInvoicePayload): Promise<Buffer> | Buffer
}


