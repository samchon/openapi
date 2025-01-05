import { OpenApi } from "../../OpenApi";
import { IClaudeSchema } from "../../structures/IClaudeSchema";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../typings/IResult";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace ClaudeSchemaComposer {
  /**
   * @internal
   */
  export const IS_DEFS = true;

  export const parameters = (props: {
    config: IClaudeSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IClaudeSchema.IParameters, IOpenApiSchemaError> =>
    LlmSchemaV3_1Composer.parameters({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const schema = (props: {
    config: IClaudeSchema.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, IClaudeSchema>;
    schema: OpenApi.IJsonSchema;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IClaudeSchema, IOpenApiSchemaError> =>
    LlmSchemaV3_1Composer.schema({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const separateParameters = (props: {
    predicate: (schema: IClaudeSchema) => boolean;
    parameters: IClaudeSchema.IParameters;
  }): ILlmFunction.ISeparated<"claude"> =>
    LlmSchemaV3_1Composer.separateParameters(
      props,
    ) as any as ILlmFunction.ISeparated<"claude">;
}
