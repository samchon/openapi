import { OpenApi } from "../OpenApi";
import { IHttpLlmFunction } from "./IHttpLlmFunction";
import { IHttpMigrateRoute } from "./IHttpMigrateRoute";
import { ILlmApplication } from "./ILlmApplication";
import { ILlmSchema } from "./ILlmSchema";
import { ILlmSchemaV3 } from "./ILlmSchemaV3";

/**
 * Application of LLM function call from OpenAPI document.
 *
 * `IHttpLlmApplication` is a data structure representing a collection of
 * {@link IHttpLlmFunction LLM function calling schemas} composed from the
 * {@link OpenApi.IDocument OpenAPI document} and its
 * {@link OpenApi.IOperation operation} metadata. It also contains
 * {@link IHttpLlmApplication.errors failed operations}, and adjusted
 * {@link IHttpLlmApplication.options options} during the `IHttpLlmApplication`
 * construction.
 *
 * About the {@link OpenApi.IOperation API operations}, they are converted to
 * {@link IHttpLlmFunction} type which represents LLM function calling schema. By
 * the way, if there're some types which does not supported by LLM, the
 * operation would be failed and pushed into the
 * {@link IHttpLlmApplication.errors}. Otherwise not, the operation would be
 * successfully converted to {@link IHttpLlmFunction} and its type schemas are
 * downgraded to {@link OpenApiV3.IJsonSchema} and converted to
 * {@link ILlmSchemaV3}.
 *
 * For reference, the arguments type is composed by below rule.
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
 * By the way, there can be some parameters (or their nested properties) which
 * must be composed by Human, not by LLM. File uploading feature or some
 * sensitive information like secret key (password) are the examples. In that
 * case, you can separate the function parameters to both LLM and Human sides by
 * configuring the {@link IHttpLlmApplication.IOptions.separate} property. The
 * separated parameters are assigned to the {@link IHttpLlmFunction.separated}
 * property.
 *
 * For reference, the actual function call execution is not by LLM, but by you.
 * When the LLM selects the proper function and fills the arguments, you just
 * call the function by {@link HttpLlm.execute} with the LLM prepared arguments.
 * And then informs the return value to the LLM by system prompt. The LLM will
 * continue the next conversation based on the return value.
 *
 * Additionally, if you've configured
 * {@link IHttpLlmApplication.IOptions.separate}, so that the parameters are
 * separated to Human and LLM sides, you can merge these humand and LLM sides'
 * parameters into one through {@link HttpLlm.mergeParameters} before the actual
 * LLM function call execution.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IHttpLlmApplication<Model extends ILlmSchema.Model> {
  /** Model of the target LLM. */
  model: Model;

  /**
   * List of function metadata.
   *
   * List of function metadata that can be used for the LLM function call.
   *
   * When you want to execute the function with LLM constructed arguments, you
   * can do it through {@link LlmFetcher.execute} function.
   */
  functions: IHttpLlmFunction<Model>[];

  /** List of errors occurred during the composition. */
  errors: IHttpLlmApplication.IError[];

  /** Configuration for the application. */
  options: IHttpLlmApplication.IOptions<Model>;
}
export namespace IHttpLlmApplication {
  /** Options for the HTTP LLM application schema composition. */
  export type IOptions<Model extends ILlmSchema.Model> =
    ILlmApplication.IOptions<Model> & {
      /**
       * Maximum length of function name.
       *
       * When a function name is longer than this value, it will be truncated.
       *
       * If not possible to truncate due to the duplication, the function name
       * would be modified to randomly generated (UUID v4).
       *
       * @default 64
       */
      maxLength?: number;
    };

  /** Error occurred in the composition. */
  export interface IError {
    /** HTTP method of the endpoint. */
    method: "get" | "post" | "put" | "patch" | "delete" | "head";

    /** Path of the endpoint. */
    path: string;

    /** Error messages. */
    messages: string[];

    /**
     * Get the Swagger operation metadata.
     *
     * Get the Swagger operation metadata, of the source.
     */
    operation: () => OpenApi.IOperation;

    /**
     * Get the migration route metadata.
     *
     * Get the migration route metadata, of the source.
     *
     * If the property returns `undefined`, it means that the error has been
     * occurred in the migration level, not of LLM application composition.
     *
     * @returns Migration route metadata.
     */
    route: () => IHttpMigrateRoute | undefined;
  }
}
