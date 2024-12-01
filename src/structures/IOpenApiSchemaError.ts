import { OpenApi } from "../OpenApi";

export interface IOpenApiSchemaError {
  method: string;
  message: string;
  reasons: IOpenApiSchemaError.IReason[];
}
export namespace IOpenApiSchemaError {
  export interface IReason {
    schema: OpenApi.IJsonSchema;
    accessor: string;
    message: string;
  }
}
