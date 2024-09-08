import { HttpMigration } from "./HttpMigration";
import { OpenApi } from "./OpenApi";
import { HttpLlmConverter } from "./converters/HttpLlmConverter";
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
 * LLM function calling application composer from OpenAPI document.
 *
 * `HttpLlm` is a module for composing LLM (Large Language Model) function calling
 * application from the {@link OpenApi.IDocument OpenAPI document}, and also for
 * LLM function call execution and parameter merging.
 *
 * At first, you can construct the LLM function calling application by the
 * {@link HttpLlm.application HttpLlm.application()} function. And then the LLM
 * has selected a {@link IHttpLlmFunction function} to call and composes its
 * arguments, you can execute the function by
 * {@link HttpLlm.execute HttpLlm.execute()} or
 * {@link HttpLlm.propagate HttpLlm.propagate()}.
 *
 * By the way, if you have configured the {@link IHttpLlmApplication.IOptions.separate}
 * option to separate the parameters into human and LLM sides, you can merge these
 * human and LLM sides' parameters into one through
 * {@link HttpLlm.mergeParameters HttpLlm.mergeParameters()} before the actual LLM
 * function call execution.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace HttpLlm {
  /* -----------------------------------------------------------
    COMPOSERS
  ----------------------------------------------------------- */
  /**
   * Convert OpenAPI document to LLM function calling application.
   *
   * Converts {@link OpenApi.IDocument OpenAPI document} or
   * {@link IHttpMigrateApplication migrated application} to the
   * {@link IHttpLlmApplication LLM function calling application}. Every
   * {@link OpenApi.IOperation API operations} in the OpenAPI document are converted
   * to the {@link IHttpLlmFunction LLM function} type, and they would be used for
   * the LLM function calling.
   *
   * If you have configured the {@link IHttpLlmApplication.IOptions.separate} option,
   * every parameters in the {@link IHttpLlmFunction} would be separated into both
   * human and LLM sides. In that case, you can merge these human and LLM sides'
   * parameters into one through {@link HttpLlm.mergeParameters} before the actual
   * LLM function call execution.
   *
   * Additionally, if you have configured the {@link IHttpLlmApplication.IOptions.keyword}
   * as `true`, the number of {@link IHttpLlmFunction.parameters} are always 1 and the
   * first parameter type is always {@link ILlmSchema.IObject}. I recommend this option
   * because LLM can understand the keyword arguments more easily.
   *
   * @param document Target OpenAPI document to convert (or migrate application)
   * @param options Options for the LLM function calling application conversion
   * @returns LLM function calling application
   */
  export const application = <
    Schema extends ILlmSchema,
    Operation extends OpenApi.IOperation,
  >(
    document:
      | OpenApi.IDocument<any, Operation>
      | IHttpMigrateApplication<any, Operation>,
    options?: Partial<IHttpLlmApplication.IOptions>,
  ): IHttpLlmApplication<Schema> => {
    // MIGRATE
    if ((document as OpenApi.IDocument)["x-samchon-emended"] === true)
      document = HttpMigration.application(
        document as OpenApi.IDocument<any, Operation>,
      );
    return HttpLlmConverter.compose(
      document as IHttpMigrateApplication<any, Operation>,
      {
        keyword: options?.keyword ?? false,
        separate: options?.separate ?? null,
      },
    );
  };

  /**
   * Convert JSON schema to LLM schema.
   *
   * Converts {@link OpenApi.IJsonSchema JSON schema} to {@link ILlmSchema LLM schema}.
   *
   * By the way, if the target JSON schema has some recursive references, the
   * conversion would be failed and `null` value would be returned. It's because
   * the LLM schema does not support the reference type embodied by the
   * {@link OpenApi.IJsonSchema.IReference} type.
   *
   * @param props Schema to convert and components to refer
   * @returns LLM schema or null value
   */
  export const schema = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): ILlmSchema | null => HttpLlmConverter.schema(props);

  /* -----------------------------------------------------------
    FETCHERS
  ----------------------------------------------------------- */
  /**
   * Properties for the LLM function call.
   */
  export interface IFetchProps {
    /**
     * Application of the LLM function calling.
     */
    application: IHttpLlmApplication;

    /**
     * LLM function schema to call.
     */
    function: IHttpLlmFunction;

    /**
     * Connection info to the HTTP server.
     */
    connection: IHttpConnection;

    /**
     * Arguments for the function call.
     */
    arguments: any[];
  }

  /**
   * Execute the LLM function call.
   *
   * `HttmLlm.execute()` is a function executing the target
   * {@link OpenApi.IOperation API endpoint} with with the connection information
   * and arguments composed by Large Language Model like OpenAI (+human sometimes).
   *
   * By the way, if you've configured the {@link IHttpLlmApplication.IOptions.separate},
   * so that the parameters are separated to human and LLM sides, you have to merge
   * these humand and LLM sides' parameters into one through
   * {@link HttpLlm.mergeParameters} function.
   *
   * About the {@link IHttpLlmApplication.IOptions.keyword} option, don't worry anything.
   * This `HttmLlm.execute()` function will automatically recognize the keyword arguments
   * and convert them to the proper sequence.
   *
   * For reference, if the target API endpoinnt responds none 200/201 status, this
   * would be considered as an error and the {@link HttpError} would be thrown.
   * Otherwise you don't want such rule, you can use the {@link HttpLlm.propagate}
   * function instead.
   *
   * @param props Properties for the LLM function call
   * @returns Return value (response body) from the API endpoint
   * @throws HttpError when the API endpoint responds none 200/201 status
   */
  export const execute = (props: IFetchProps): Promise<unknown> =>
    HttpLlmFunctionFetcher.execute(props);

  /**
   * Propagate the LLM function call.
   *
   * `HttmLlm.propagate()` is a function propagating the target
   * {@link OpenApi.IOperation API endpoint} with with the connection information
   * and arguments composed by Large Language Model like OpenAI (+human sometimes).
   *
   * By the way, if you've configured the {@link IHttpLlmApplication.IOptions.separate},
   * so that the parameters are separated to human and LLM sides, you have to merge
   * these humand and LLM sides' parameters into one through
   * {@link HttpLlm.mergeParameters} function.
   *
   * About the {@link IHttpLlmApplication.IOptions.keyword} option, don't worry anything.
   * This `HttmLlm.propagate()` function will automatically recognize the keyword arguments
   * and convert them to the proper sequence.
   *
   * For reference, the propagation means always returning the response from the API
   * endpoint, even if the status is not 200/201. This is useful when you want to
   * handle the response by yourself.
   *
   * @param props Properties for the LLM function call
   * @returns Response from the API endpoint
   * @throws Error only when the connection is failed
   */
  export const propagate = (props: IFetchProps): Promise<IHttpResponse> =>
    HttpLlmFunctionFetcher.propagate(props);

  /* -----------------------------------------------------------
    MERGERS
  ----------------------------------------------------------- */
  /**
   * Properties for the parameters' merging.
   */
  export interface IMergeProps {
    /**
     * Metadata of the target function.
     */
    function: ILlmFunction;

    /**
     * Arguments composed by the LLM.
     */
    llm: unknown[];

    /**
     * Arguments composed by the human.
     */
    human: unknown[];
  }

  /**
   * Merge the parameters.
   *
   * If you've configured the {@link IHttpLlmApplication.IOptions.separate} option,
   * so that the parameters are separated to human and LLM sides, you can merge these
   * humand and LLM sides' parameters into one through this `HttpLlm.mergeParameters()`
   * function before the actual LLM function call execution.
   *
   * On contrary, if you've not configured the
   * {@link IHttpLlmApplication.IOptions.separate} option, this function would throw
   * an error.
   *
   * @param props Properties for the parameters' merging
   * @returns Merged parameter values
   */
  export const mergeParameters = (props: IMergeProps): unknown[] =>
    LlmDataMerger.parameters(props);

  /**
   * Merge two values.
   *
   * If both values are objects, then combines them in the properties level.
   *
   * Otherwise, returns the latter value if it's not null, otherwise the former value.
   *
   * - `return (y ?? x)`
   *
   * @param x Value X to merge
   * @param y Value Y to merge
   * @returns Merged value
   */
  export const mergeValue = (x: unknown, y: unknown): unknown =>
    LlmDataMerger.value(x, y);
}
