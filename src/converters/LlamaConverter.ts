import { OpenApi } from "../OpenApi";
import { ILlamaSchema } from "../structures/ILlamaSchema";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace LlamaConverter {
  export const parameters = (props: {
    config: ILlamaSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    errors?: string[];
    accessor?: string;
  }): ILlamaSchema.IParameters | null =>
    LlmConverterV3_1.parameters({
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
    errors?: string[];
    accessor?: string;
    refAccessor?: string;
  }): ILlamaSchema | null =>
    LlmConverterV3_1.schema({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const separate = (props: {
    predicate: (schema: ILlamaSchema) => boolean;
    schema: ILlamaSchema;
  }): [ILlamaSchema | null, ILlamaSchema | null] =>
    LlmConverterV3_1.separate(props);
}
