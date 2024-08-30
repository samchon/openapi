export interface IHttpResponse {
  status: number;
  headers: Record<string, string | string[]>;
  body: unknown;
}
