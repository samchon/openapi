import { OpenApi } from "./OpenApi";

export interface IMigrateRoute {
  method: "head" | "get" | "post" | "put" | "patch" | "delete";
  path: string;
  emendedPath: string;
  accessor: string[]; // function accessor
  parameters: IMigrateRoute.IParameter[]; // path parameters
  headers: IMigrateRoute.IHeaders | null; // as an object
  query: IMigrateRoute.IQuery | null; // as an object
  body: IMigrateRoute.IBody | null; // request body
  success: IMigrateRoute.IBody | null; // 200 or 201 status case
  exceptions: Record<string, IMigrateRoute.IException>; // other status cases
  comment: () => string;
  operation: () => OpenApi.IOperation;
}
export namespace IMigrateRoute {
  export interface IParameter {
    name: string;
    key: string;
    schema: OpenApi.IJsonSchema;
    description?: string;
  }
  export interface IHeaders {
    name: string; // headers
    key: string; // headers
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }
  export interface IQuery {
    name: string;
    key: string;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }
  export interface IBody {
    name: string;
    key: string;
    type:
      | "text/plain"
      | "application/json"
      | "application/x-www-form-urlencoded"
      | "multipart/form-data";
    schema: OpenApi.IJsonSchema;
    "x-nestia-encrypted"?: boolean;
  }
  export interface IException {
    description?: string;
    schema: OpenApi.IJsonSchema;
  }
}
