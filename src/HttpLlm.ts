import { HttpMigration } from "./HttpMigration";
import { OpenApi } from "./OpenApi";
import { OpenApiV3 } from "./OpenApiV3";
import { OpenApiV3_1 } from "./OpenApiV3_1";
import { SwaggerV2 } from "./SwaggerV2";
import { HttpLlmComposer } from "./composers/HttpLlmApplicationComposer";
import { LlmSchemaComposer } from "./composers/LlmSchemaComposer";
import { HttpLlmFunctionFetcher } from "./http/HttpLlmFunctionFetcher";
import { IHttpConnection } from "./structures/IHttpConnection";
import { IHttpLlmApplication } from "./structures/IHttpLlmApplication";
import { IHttpLlmFunction } from "./structures/IHttpLlmFunction";
import { IHttpMigrateApplication } from "./structures/IHttpMigrateApplication";
import { IHttpResponse } from "./structures/IHttpResponse";
import { ILlmFunction } from "./structures/ILlmFunction";
import { ILlmSchema } from "./structures/ILlmSchema";
import { LlmDataMerger } from "./utils/LlmDataMerger";

/**
 * LLM function calling application composer from OpenAPI documents.
 *
 * `HttpLlm` is a module for converting OpenAPI documents into LLM (Large Language Model) 
 * function calling applications. It handles schema conversion, function execution, and 
 * parameter merging for AI-powered API interactions.
 *
 * **Core workflow:**
 * 1. Convert OpenAPI document to LLM application using {@link HttpLlm.application}
 * 2. LLM selects and composes arguments for a {@link IHttpLlmFunction function}
 * 3. Execute the function using {@link HttpLlm.execute} or {@link HttpLlm.propagate}
 *
 * **Parameter separation:** If you configure {@link IHttpLlmApplication.IOptions.separate} 
 * to separate parameters between human and LLM sides, use {@link HttpLlm.mergeParameters} 
 * to combine them before execution.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace HttpLlm {
  /* -----------------------------------------------------------
    COMPOSERS
  ----------------------------------------------------------- */
  /**
   * Properties for the LLM function calling application composer.
   *
   * @template Model Target LLM model
   */
  export interface IApplicationProps<Model extends ILlmSchema.Model> {
    /** Target LLM model. */
    model: Model;

    /** OpenAPI document to convert. */
    document:
      | OpenApi.IDocument
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument;

    /** Options for the LLM function calling schema conversion. */
    options?: Partial<IHttpLlmApplication.IOptions<Model>>;
  }

  /**
   * Convert OpenAPI document to LLM function calling application.
   *
   * Transforms OpenAPI documents into LLM-compatible function calling applications.
   * Each {@link OpenApi.IOperation API operation} becomes an {@link IHttpLlmFunction LLM function}
   * that AI models can understand and invoke.
   *
   * **Parameter handling:**
   * - **Separated mode:** When {@link IHttpLlmApplication.IOptions.separate} is enabled,
   *   parameters split between human and LLM sides. Use {@link HttpLlm.mergeParameters} 
   *   to combine them before execution.
   * - **Keyword mode:** When {@link IHttpLlmApplication.IOptions.keyword} is `true`,
   *   all parameters become a single {@link ILlmSchemaV3.IObject}. Recommended for 
   *   better LLM understanding.
   *
   * @param props Configuration properties for the conversion
   * @returns LLM function calling application ready for AI interaction
   */
  export const application = <Model extends ILlmSchema.Model>(
    props: IApplicationProps<Model>,
  ): IHttpLlmApplication<Model> => {
    // MIGRATE
    const migrate: IHttpMigrateApplication = HttpMigration.application(
      props.document,
    );
    const defaultConfig: ILlmSchema.IConfig<Model> =
      LlmSchemaComposer.defaultConfig(props.model);
    return HttpLlmComposer.application<Model>({
      migrate,
      model: props.model,
      options: {
        ...Object.fromEntries(
          Object.entries(defaultConfig).map(
            ([key, value]) =>
              [key, (props.options as any)?.[key] ?? value] as const,
          ),
        ),
        separate: props.options?.separate ?? null,
        maxLength: props.options?.maxLength ?? 64,
        equals: props.options?.equals ?? false,
      } as any as IHttpLlmApplication.IOptions<Model>,
    });
  };

  /* -----------------------------------------------------------
    FETCHERS
  ----------------------------------------------------------- */
  /** Properties for the LLM function call. */
  export interface IFetchProps<Model extends ILlmSchema.Model> {
    /** Application of the LLM function calling. */
    application: IHttpLlmApplication<Model>;

    /** LLM function schema to call. */
    function: IHttpLlmFunction<ILlmSchema.Model>;

    /** Connection info to the HTTP server. */
    connection: IHttpConnection;

    /** Input arguments for the function call. */
    input: object;
  }

  /**
   * Execute the LLM function call.
   *
   * Executes an {@link OpenApi.IOperation API endpoint} using connection information
   * and arguments composed by an LLM (with optional human input).
   *
   * **Parameter handling:**
   * - **Separated parameters:** If {@link IHttpLlmApplication.IOptions.separate} is enabled,
   *   merge human and LLM parameters using {@link HttpLlm.mergeParameters} first.
   * - **Keyword arguments:** Automatically handles {@link IHttpLlmApplication.IOptions.keyword}
   *   format conversion.
   *
   * **Error handling:** Throws {@link HttpError} for non-200/201 status responses.
   * For custom error handling, use {@link HttpLlm.propagate} instead.
   *
   * @param props Properties containing application, function, connection, and input
   * @returns API response body on successful execution
   * @throws HttpError when API returns non-200/201 status
   */
  export const execute = <Model extends ILlmSchema.Model>(
    props: IFetchProps<Model>,
  ): Promise<unknown> => HttpLlmFunctionFetcher.execute<Model>(props);

  /**
   * Propagate the LLM function call.
   *
   * Executes an {@link OpenApi.IOperation API endpoint} and returns the raw response
   * regardless of HTTP status code. Unlike {@link HttpLlm.execute}, this method
   * does not throw errors for non-200/201 responses.
   *
   * **Parameter handling:**
   * - **Separated parameters:** If {@link IHttpLlmApplication.IOptions.separate} is enabled,
   *   merge human and LLM parameters using {@link HttpLlm.mergeParameters} first.
   * - **Keyword arguments:** Automatically handles {@link IHttpLlmApplication.IOptions.keyword}
   *   format conversion.
   *
   * **Use case:** Ideal when you need custom error handling or want to process
   * all HTTP status codes manually.
   *
   * @param props Properties containing application, function, connection, and input
   * @returns Complete HTTP response including status and headers
   * @throws Error only when network connection fails
   */
  export const propagate = <Model extends ILlmSchema.Model>(
    props: IFetchProps<Model>,
  ): Promise<IHttpResponse> => HttpLlmFunctionFetcher.propagate<Model>(props);

  /* -----------------------------------------------------------
    MERGERS
  ----------------------------------------------------------- */
  /** Properties for the parameters' merging. */
  export interface IMergeProps<Model extends ILlmSchema.Model> {
    /** Metadata of the target function. */
    function: ILlmFunction<Model>;

    /** Arguments composed by the LLM. */
    llm: object | null;

    /** Arguments composed by the human. */
    human: object | null;
  }

  /**
   * Merge separated parameters.
   *
   * Combines human and LLM composed parameters into a single object when
   * {@link IHttpLlmApplication.IOptions.separate} mode is enabled.
   *
   * **Usage scenario:** When parameters are separated between human and LLM sides,
   * use this function before calling {@link HttpLlm.execute} or {@link HttpLlm.propagate}.
   *
   * **Error condition:** Throws an error if {@link IHttpLlmApplication.IOptions.separate}
   * was not configured during application creation.
   *
   * @param props Configuration with function metadata and separated parameters
   * @returns Merged parameter object ready for function execution
   * @throws Error when separation mode was not enabled
   */
  export const mergeParameters = <Model extends ILlmSchema.Model>(
    props: IMergeProps<Model>,
  ): object => LlmDataMerger.parameters(props);

  /**
   * Merge two values intelligently.
   *
   * Combines two values using intelligent merging logic:
   * - **Objects:** Merges properties recursively
   * - **Other types:** Returns the latter value if not null, otherwise the former
   *
   * **Logic:** `return (y ?? x)`
   *
   * @param x First value to merge
   * @param y Second value to merge (takes precedence when not null)
   * @returns Intelligently merged result
   */
  export const mergeValue = (x: unknown, y: unknown): unknown =>
    LlmDataMerger.value(x, y);
}
