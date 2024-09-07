import { OpenApi } from "../OpenApi";
import { IHttpLlmFunction } from "./IHttpLlmFunction";
import { IHttpMigrateRoute } from "./IHttpMigrateRoute";
import { ILlmSchema } from "./ILlmSchema";

export interface IHttpLlmApplication<
  Schema extends ILlmSchema = ILlmSchema,
  Operation extends OpenApi.IOperation = OpenApi.IOperation,
  Route extends IHttpMigrateRoute = IHttpMigrateRoute,
> {
  /**
   * Version of OpenAPI.
   *
   * LLM function call schema is based on OpenAPI 3.0.3 specification.
   */
  openapi: "3.0.3";

  /**
   * List of function metadata.
   *
   * List of function metadata that can be used for the LLM function call.
   *
   * When you want to execute the function with LLM constructed arguments,
   * you can do it through {@link LlmFetcher.execute} function.
   */
  functions: IHttpLlmFunction[];

  /**
   * List of errors occurred during the composition.
   */
  errors: IHttpLlmApplication.IError<Operation, Route>[];

  /**
   * Options for the document.
   *
   * Adjusted options when composing the document through
   * {@link HttpLlm.application} function.
   */
  options: IHttpLlmApplication.IOptions<Schema>;
}
export namespace IHttpLlmApplication {
  /**
   * Error occurred in the composition.
   */
  export interface IError<
    Operation extends OpenApi.IOperation = OpenApi.IOperation,
    Route extends IHttpMigrateRoute = IHttpMigrateRoute,
  > {
    /**
     * HTTP method of the endpoint.
     */
    method: "get" | "post" | "put" | "patch" | "delete" | "head";

    /**
     * Path of the endpoint.
     */
    path: string;

    /**
     * Error messsages.
     */
    messages: string[];

    /**
     * Get the Swagger operation metadata.
     *
     * Get the Swagger operation metadata, of the source.
     */
    operation: () => Operation;

    /**
     * Get the migration route metadata.
     *
     * Get the migration route metadata, of the source.
     *
     * If the property returns `undefined`, it means that the error has
     * been occured in the migration level, not of LLM document composition.
     *
     * @returns Migration route metadata.
     */
    route: () => Route | undefined;
  }

  /**
   * Options for composing the LLM document.
   */
  export interface IOptions<Schema extends ILlmSchema = ILlmSchema> {
    /**
     * Whether the parameters are keyworded or not.
     *
     * If this property value is `true`, length of the
     * {@link IHttpLlmApplication.IFunction.parameters} is always 1, and type of
     * the pararameter is always {@link ILlmSchema.IObject} type.
     * Also, its properties are following below rules:
     *
     * - `pathParameters`: Path parameters of {@link IHttpMigrateRoute.parameters}
     * - `query`: Query parameter of {@link IHttpMigrateRoute.query}
     * - `body`: Body parameter of {@link IHttpMigrateRoute.body}
     *
     * ```typescript
     * {
     *   ...pathParameters,
     *   query,
     *   body,
     * }
     * ```
     *
     * Otherwise (this property value is `false`), length of the
     * {@link IHttpLlmFunction.parameters} is variable, and sequence of the
     * parameters are following below rules.
     *
     * ```typescript
     * [
     *   ...pathParameters,
     *   ...(query ? [query] : []),
     *   ...(body ? [body] : []),
     * ]
     * ```
     *
     * @default false
     */
    keyword: boolean;

    /**
     * Separator function for the parameters.
     *
     * When composing parameter arguments through LLM function call,
     * there can be a case that some parameters must be composed by human,
     * or LLM cannot understand the parameter. For example, if the
     * parameter type has configured
     * {@link ILlmSchema.IString.contentMediaType} which indicates file
     * uploading, it must be composed by human, not by LLM
     * (Large Language Model).
     *
     * In that case, if you configure this property with a function that
     * predicating whether the schema value must be composed by human or
     * not, the parameters would be separated into two parts.
     *
     * - {@link IHttpLlmFunction.separated.llm}
     * - {@link IHttpLlmFunction.separated.human}
     *
     * When writing the function, note that returning value `true` means
     * to be a human composing the value, and `false` means to LLM
     * composing the value. Also, when predicating the schema, it would
     * better to utilize the {@link LlmTypeChecker} features.
     *
     * @param schema Schema to be separated.
     * @returns Whether the schema value must be composed by human or not.
     * @default null
     */
    separate: null | ((schema: Schema) => boolean);
  }
}
