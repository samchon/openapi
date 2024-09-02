import { OpenApi } from "../OpenApi";
import { IHttpMigrateRoute } from "./IHttpMigrateRoute";

/**
 * Document of migration.
 *
 * The `IHttpMigrateApplication` interface is an application migrated from
 * {@link OpenAPI.IDocument OpenAPI document} to RPC (Remote Procedure Call)
 * functions; {@link IHttpMigrateRoute}.
 *
 * As the `IHttpMigrateApplication` and {@link IHttpMigrateRoute} have a lot of special
 * stories, when you're developing OpenAPI generator library, please read
 * their descriptions carefully including the description of properties.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IHttpMigrateApplication<
  Schema extends OpenApi.IJsonSchema = OpenApi.IJsonSchema,
  Operation extends OpenApi.IOperation<Schema> = OpenApi.IOperation<Schema>,
> {
  /**
   * List of routes for migration.
   */
  routes: IHttpMigrateRoute<Schema, Operation>[];

  /**
   * List of errors occurred during the migration.
   */
  errors: IHttpMigrateApplication.IError<Operation>[];

  /**
   * Source OpenAPI document.
   */
  document: () => OpenApi.IDocument<Schema, Operation>;
}
export namespace IHttpMigrateApplication {
  /**
   * Error of migration in the operation level.
   */
  export interface IError<
    Operation extends
      OpenApi.IOperation<any> = OpenApi.IOperation<OpenApi.IJsonSchema>,
  > {
    /**
     * Target operation causing the error.
     */
    operation: () => Operation;

    /**
     * Method of the operation.
     *
     * If the {@link OpenApi.IOperation.method} is not one of below type
     * values, the operation would be ignored in the migration process for
     * the RPC (Remote Procedure Call) function.
     */
    method: "head" | "get" | "post" | "put" | "patch" | "delete";

    /**
     * Original path from the OpenAPI document.
     */
    path: string;

    /**
     * List of error messages (reasons).
     */
    messages: string[];
  }
}
