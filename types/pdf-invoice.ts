declare module "@h1dd3nsn1p3r/pdf-invoice" {
  import type {
    InvoicePayLoad,
    Configuration,
  } from "@h1dd3nsn1p3r/pdf-invoice/global"

  export class PDFInvoice {
    constructor(payload: InvoicePayLoad, config?: Partial<Configuration>)
    create(): Promise<string>
  }
}


