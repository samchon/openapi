import { HttpMigration } from "./HttpMigration";
import { OpenApi } from "./OpenApi";
import { LlmComposer } from "./converters/LlmComposer";
import { LlmMerger } from "./converters/LlmMerger";
import { HttpLlmFunctionFetcher } from "./http/HttpLlmFunctionFetcher";
import { IHttpConnection } from "./structures/IHttpConnection";
import { IHttpLlmApplication } from "./structures/IHttpLlmApplication";
import { IHttpLlmFunction } from "./structures/IHttpLlmFunction";
import { IHttpMigrateApplication } from "./structures/IHttpMigrateApplication";
import { IHttpResponse } from "./structures/IHttpResponse";
import { ILlmSchema } from "./structures/ILlmSchema";

export namespace HttpLanguageModel {
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
    return LlmComposer.compose(
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
  }): ILlmSchema | null => LlmComposer.schema(props);

  export interface IExecutionProps {
    /**
     * Document of the OpenAI function call schemas.
     */
    document: IHttpLlmApplication;

    /**
     * Procedure schema to call.
     */
    procedure: IHttpLlmFunction;

    /**
     * Connection info to the server.
     */
    connection: IHttpConnection;

    /**
     * Arguments for the function call.
     */
    arguments: any[];
  }
  export const execute = (props: IExecutionProps): Promise<unknown> =>
    HttpLlmFunctionFetcher.execute(props);

  export const propagate = (props: IExecutionProps): Promise<IHttpResponse> =>
    HttpLlmFunctionFetcher.propagate(props);

  export interface IMergeProps {
    function: IHttpLlmFunction;
    llm: unknown[];
    human: unknown[];
  }
  export const merge = (props: IMergeProps): unknown[] =>
    LlmMerger.parameters(props);
}
