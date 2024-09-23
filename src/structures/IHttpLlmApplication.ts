import { OpenApi } from "../OpenApi";
import { IHttpLlmFunction } from "./IHttpLlmFunction";
import { IHttpMigrateRoute } from "./IHttpMigrateRoute";
import { ILlmSchema } from "./ILlmSchema";

/**
 * Application of LLM function call from OpenAPI document.
 *
 * `IHttpLlmApplication` is a data structure representing a collection of
 * {@link IHttpLlmFunction LLM function calling schemas} composed from the
 * {@link OpenApi.IDocument OpenAPI document} and its {@link OpenApi.IOperation operation}
 * metadata. It also contains {@link IHttpLlmApplication.errors failed operations}, and
 * adjusted {@link IHttpLlmApplication.options options} during the `IHttpLlmApplication`
 * construction.
 *
 * About the {@link OpenApi.IOperation API operations}, they are converted to
 * {@link IHttpLlmFunction} type which represents LLM function calling schema.
 * By the way, if tehre're some recursive types which can't escape the
 * {@link OpenApi.IJsonSchema.IReference} type, the operation would be failed and
 * pushed into the {@link IHttpLlmApplication.errors}. Otherwise not, the operation
 * would be successfully converted to {@link IHttpLlmFunction} and its type schemas
 * are downgraded to {@link OpenApiV3.IJsonSchema} and converted to {@link ILlmSchema}.
 *
 * About the options, if you've configured {@link IHttpLlmApplication.options.keyword}
 * (as `true`), number of {@link IHttpLlmFunction.parameters} are always 1 and the first
 * parameter type is always {@link ILlmSchema.IObject}. Otherwise, the parameters would
 * be multiple, and the sequence of the parameters are following below rules.
 *
 * - `pathParameters`: Path parameters of {@link IHttpMigrateRoute.parameters}
 * - `query`: Query parameter of {@link IHttpMigrateRoute.query}
 * - `body`: Body parameter of {@link IHttpMigrateRoute.body}
 *
 * ```typescript
 * // KEYWORD TRUE
 * {
 *   ...pathParameters,
 *   query,
 *   body,
 * }
 *
 * // KEYWORD FALSE
 * [
 *   ...pathParameters,
 *   ...(query ? [query] : []),
 *   ...(body ? [body] : []),
 * ]
 * ```
 *
 * By the way, there can be some parameters (or their nested properties) which must be
 * composed by Human, not by LLM. File uploading feature or some sensitive information
 * like secrety key (password) are the examples. In that case, you can separate the
 * function parameters to both LLM and Human sides by configuring the
 * {@link IHttpLlmApplication.IOptions.separate} property. The separated parameters are
 * assigned to the {@link IHttpLlmFunction.separated} property.
 *
 * For reference, the actual function call execution is not by LLM, but by you.
 * When the LLM selects the proper function and fills the arguments, you just call
 * the function by {@link HttpLlm.execute} with the LLM prepared arguments. And then
 * informs the return value to the LLM by system prompt. The LLM will continue the next
 * conversation based on the return value.
 *
 * Additionally, if you've configured {@link IHttpLlmApplication.IOptions.separate},
 * so that the parameters are separated to Human and LLM sides, you can merge these
 * humand and LLM sides' parameters into one through {@link HttpLlm.mergeParameters}
 * before the actual LLM function call execution.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
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
   * Options for the application.
   *
   * Adjusted options when composing the application through
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
     * been occured in the migration level, not of LLM application composition.
     *
     * @returns Migration route metadata.
     */
    route: () => Route | undefined;
  }

  /**
   * Options for composing the LLM application.
   */
  export interface IOptions<Schema extends ILlmSchema = ILlmSchema> {
    /**
     * Whether the parameters are keyworded or not.
     *
     * If this property value is `true`, length of the
     * {@link IHttpLlmApplication.IFunction.parameters} is always 1, and type of
     * the pararameter is always {@link ILlmSchema.IObject} type.
     *
     * Otherwise, the parameters would be multiple, and the sequence of the parameters
     * are following below rules.
     *
     * ```typescript
     * // KEYWORD TRUE
     * {
     *   ...pathParameters,
     *   query,
     *   body,
     * }
     *
     * // KEYWORD FALSE
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
     * there can be a case that some parameters must be composed by Human,
     * or LLM cannot understand the parameter. For example, if the
     * parameter type has configured
     * {@link ILlmSchema.IString.contentMediaType} which indicates file
     * uploading, it must be composed by Human, not by LLM
     * (Large Language Model).
     *
     * In that case, if you configure this property with a function that
     * predicating whether the schema value must be composed by Human or
     * not, the parameters would be separated into two parts.
     *
     * - {@link IHttpLlmFunction.separated.llm}
     * - {@link IHttpLlmFunction.separated.Human}
     *
     * When writing the function, note that returning value `true` means
     * to be a Human composing the value, and `false` means to LLM
     * composing the value. Also, when predicating the schema, it would
     * better to utilize the {@link LlmTypeChecker} features.
     *
     * @param schema Schema to be separated.
     * @returns Whether the schema value must be composed by Human or not.
     * @default null
     */
    separate: null | ((schema: Schema) => boolean);
  }
}
