import { OpenApi } from "../OpenApi";
import { ILlamaSchema } from "../structures/ILlamaSchema";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace LlamaConverter {
  export const parameters = (props: {
    config: ILlamaSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
  }): ILlamaSchema.IParameters | null =>
    LlmConverterV3_1.parameters({
      config: {
        reference: props.config.reference,
        constraint: true,
      },
      components: props.components,
      schema: props.schema,
    });

  export const schema = (props: {
    config: ILlamaSchema.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, ILlamaSchema>;
    schema: OpenApi.IJsonSchema;
  }): ILlamaSchema | null =>
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
    predicate: (schema: ILlamaSchema) => boolean;
    schema: ILlamaSchema;
  }): [ILlamaSchema | null, ILlamaSchema | null] =>
    LlmConverterV3_1.separate(props);
}
