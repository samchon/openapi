import { OpenApi } from "../../OpenApi";
import { ILlamaSchema } from "../../structures/ILlamaSchema";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace LlamaSchemaComposer {
  export const parameters = (props: {
    config: ILlamaSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    errors?: string[];
    accessor?: string;
  }): ILlamaSchema.IParameters | null =>
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
    errors?: string[];
    accessor?: string;
    refAccessor?: string;
  }): ILlamaSchema | null =>
    LlmSchemaV3_1Composer.schema({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const separate = (props: {
    predicate: (schema: ILlamaSchema) => boolean;
    schema: ILlamaSchema.IParameters;
  }): [ILlamaSchema | null, ILlamaSchema | null] =>
    LlmSchemaV3_1Composer.separate(props);
}
