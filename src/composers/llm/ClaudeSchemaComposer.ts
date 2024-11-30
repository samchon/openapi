import { OpenApi } from "../../OpenApi";
import { IClaudeSchema } from "../../structures/IClaudeSchema";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace ClaudeSchemaComposer {
  export const parameters = (props: {
    config: IClaudeSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    errors?: string[];
    accessor?: string;
  }): IClaudeSchema.IParameters | null =>
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
    errors?: string[];
    accessor?: string;
    refAccessor?: string;
  }): IClaudeSchema | null =>
    LlmSchemaV3_1Composer.schema({
      ...props,
      config: {
        reference: props.config.reference,
        constraint: true,
      },
    });

  export const separate = (props: {
    predicate: (schema: IClaudeSchema) => boolean;
    schema: IClaudeSchema.IParameters;
  }): [IClaudeSchema | null, IClaudeSchema | null] =>
    LlmSchemaV3_1Composer.separate(props);
}
