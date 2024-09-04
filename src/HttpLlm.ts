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

export namespace HttpLlm {
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

  export const schema = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): ILlmSchema | null => HttpLlmConverter.schema(props);

  export interface IFetchProps {
    /**
     * Document of the OpenAI function call schemas.
     */
    application: IHttpLlmApplication;

    /**
     * Function schema to call.
     */
    function: IHttpLlmFunction;

    /**
     * Connection info to the server.
     */
    connection: IHttpConnection;

    /**
     * Arguments for the function call.
     */
    arguments: any[];
  }
  export const execute = (props: IFetchProps): Promise<unknown> =>
    HttpLlmFunctionFetcher.execute(props);
  export const propagate = (props: IFetchProps): Promise<IHttpResponse> =>
    HttpLlmFunctionFetcher.propagate(props);

  export interface IMergeProps {
    function: ILlmFunction;
    llm: unknown[];
    human: unknown[];
  }
  export const mergeParameters = (props: IMergeProps): unknown[] =>
    LlmDataMerger.parameters(props);
  export const mergeValue = (x: unknown, y: unknown): unknown =>
    LlmDataMerger.value(x, y);
}
