import { OpenApi } from "../../OpenApi";
import { ILlamaSchema } from "../../structures/ILlamaSchema";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../typings/IResult";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace LlamaSchemaComposer {
  /**
   * @internal
   */
  export const IS_DEFS = true;

  export const parameters = (props: {
    config: ILlamaSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }): IResult<ILlamaSchema.IParameters, IOpenApiSchemaError> =>
    LlmSchemaV3_1Composer.parameters({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const schema = (props: {
    config: ILlamaSchema.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, ILlamaSchema>;
    schema: OpenApi.IJsonSchema;
  }): IResult<ILlamaSchema, IOpenApiSchemaError> =>
    LlmSchemaV3_1Composer.schema({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const separateParameters = (props: {
    predicate: (schema: ILlamaSchema) => boolean;
    parameters: ILlamaSchema.IParameters;
  }): ILlmFunction.ISeparated<"llama"> =>
    LlmSchemaV3_1Composer.separateParameters(
      props,
    ) as any as ILlmFunction.ISeparated<"llama">;

  export const invert = (props: {
    components: OpenApi.IComponents;
    schema: ILlamaSchema;
    $defs: Record<string, ILlamaSchema>;
  }): OpenApi.IJsonSchema => LlmSchemaV3_1Composer.invert(props);
}
