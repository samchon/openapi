import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { ILlmApplication } from "../structures/ILlmApplication";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { ChatGptConverter } from "./ChatGptConverter";
import { GeminiConverter } from "./GeminiConverter";
import { LlmConverterV3 } from "./LlmConverterV3";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace LlmSchemaConverter {
  export const parameters = <Model extends ILlmApplication.Model>(
    model: Model,
  ) => PARAMETERS_CASTERS[model];

  export const schema = <Model extends ILlmApplication.Model>(model: Model) =>
    SCHEMA_CASTERS[model];
}

const PARAMETERS_CASTERS = {
  "3.0": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    config: ILlmSchemaV3.IConfig;
  }) =>
    LlmConverterV3.parameters({
      components: props.components,
      schema: props.schema,
      config: props.config,
    }),
  gemini: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    config: IGeminiSchema.IConfig;
  }) =>
    GeminiConverter.parameters({
      components: props.components,
      schema: props.schema,
      config: props.config,
    }),
  "3.1": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    config: ILlmSchemaV3_1.IConfig;
  }) =>
    LlmConverterV3_1.parameters({
      components: props.components,
      schema: props.schema,
      config: props.config,
    }),
  chatgpt: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    config: IChatGptSchema.IConfig;
  }) =>
    ChatGptConverter.parameters({
      components: props.components,
      schema: props.schema,
      config: props.config,
    }),
};

const SCHEMA_CASTERS = {
  "3.0": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    config: ILlmSchemaV3.IConfig;
  }) =>
    LlmConverterV3.schema({
      components: props.components,
      schema: props.schema,
      config: props.config,
    }),
  gemini: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    config: IGeminiSchema.IConfig;
  }) =>
    GeminiConverter.schema({
      components: props.components,
      schema: props.schema,
      config: props.config,
    }),
  "3.1": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    $defs: Record<string, ILlmSchemaV3_1>;
    config: ILlmSchemaV3_1.IConfig;
  }) =>
    LlmConverterV3_1.schema({
      config: props.config,
      $defs: props.$defs,
      components: props.components,
      schema: props.schema,
    }),
  chatgpt: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    $defs: Record<string, IChatGptSchema>;
    config: IChatGptSchema.IConfig;
  }) =>
    ChatGptConverter.schema({
      components: props.components,
      schema: props.schema,
      $defs: props.$defs,
      config: props.config,
    }),
};
