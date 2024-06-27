import { IMigrateRoute } from "./IMigrateRoute";
import { OpenApi } from "./OpenApi";

export interface IMigrateDocument {
  routes: IMigrateRoute[];
  errors: IMigrateDocument.IError[];
}
export namespace IMigrateDocument {
  export interface IError {
    operation: () => OpenApi.IOperation;
    method: "head" | "get" | "post" | "put" | "patch" | "delete";
    path: string;
    messages: string[];
  }
}
