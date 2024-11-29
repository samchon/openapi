import { OpenApi } from "../OpenApi";
import { IClaudeSchema } from "../structures/IClaudeSchema";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace ClaudeConverter {
  export const parameters = (props: {
    config: IClaudeSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    errors?: string[];
    accessor?: string;
  }): IClaudeSchema.IParameters | null =>
    LlmConverterV3_1.parameters({
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
    errors?: string[];
    accessor?: string;
    refAccessor?: string;
  }): IClaudeSchema | null =>
    LlmConverterV3_1.schema({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const separate = (props: {
    predicate: (schema: IClaudeSchema) => boolean;
    schema: IClaudeSchema;
  }): [IClaudeSchema | null, IClaudeSchema | null] =>
    LlmConverterV3_1.separate(props);
}
