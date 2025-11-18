// Minimal local definitions to satisfy TypeScript when the full Next.js
// type declarations are unavailable in this environment.
declare module "next" {
  export interface NextApiRequest {
    method?: string
    query: Record<string, string | string[]>
    body?: unknown
    headers: Record<string, string | string[] | undefined>
  }

  export interface NextApiResponse<T = any> {
    status(code: number): this
    setHeader(name: string, value: string | number | readonly string[]): this
    json(body: T): this
    send(body: unknown): this
  }
}


