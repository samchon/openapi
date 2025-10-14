import { OpenApi } from "../../OpenApi";
import { IClaudeSchema } from "../../structures/IClaudeSchema";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../structures/IResult";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace ClaudeSchemaComposer {
  /** @internal */
  export const IS_DEFS = true;

  export const DEFAULT_CONFIG: IClaudeSchema.IConfig = {
    reference: true,
  };

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
    parameters: IClaudeSchema.IParameters;
    predicate: (schema: IClaudeSchema) => boolean;
    convention?: (key: string, type: "llm" | "human") => string;
    equals?: boolean;
  }): ILlmFunction.ISeparated<"claude"> => {
    const separated: ILlmFunction.ISeparated<"3.1"> =
      LlmSchemaV3_1Composer.separateParameters(props);
    return separated as any as ILlmFunction.ISeparated<"claude">;
  };

  export const invert = (props: {
    components: OpenApi.IComponents;
    schema: IClaudeSchema;
    $defs: Record<string, IClaudeSchema>;
  }): OpenApi.IJsonSchema => LlmSchemaV3_1Composer.invert(props);
}
