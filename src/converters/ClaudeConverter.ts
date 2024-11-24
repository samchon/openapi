import { OpenApi } from "../OpenApi";
import { IClaudeSchema } from "../structures/IClaudeSchema";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace ClaudeConverter {
  export const parameters = (props: {
    config: IClaudeSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
  }): IClaudeSchema.IParameters | null =>
    LlmConverterV3_1.parameters({
      config: {
        reference: props.config.reference,
        constraint: true,
      },
      components: props.components,
      schema: props.schema,
    });

  export const schema = (props: {
    config: IClaudeSchema.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, IClaudeSchema>;
    schema: OpenApi.IJsonSchema;
  }): IClaudeSchema | null =>
    LlmConverterV3_1.schema({
      config: {
        reference: props.config.reference,
        constraint: true,
      },
      components: props.components,
      $defs: props.$defs,
      schema: props.schema,
    });

  export const separate = (props: {
    predicate: (schema: IClaudeSchema) => boolean;
    schema: IClaudeSchema;
  }): [IClaudeSchema | null, IClaudeSchema | null] =>
    LlmConverterV3_1.separate(props);
}
