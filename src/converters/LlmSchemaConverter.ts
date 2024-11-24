import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { IClaudeSchema } from "../structures/IClaudeSchema";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { ILlmApplication } from "../structures/ILlmApplication";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { ChatGptConverter } from "./ChatGptConverter";
import { ClaudeConverter } from "./ClaudeConverter";
import { GeminiConverter } from "./GeminiConverter";
import { LlmConverterV3 } from "./LlmConverterV3";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace LlmSchemaConverter {
  export const parameters = <Model extends ILlmApplication.Model>(
    model: Model,
  ) => PARAMETERS_CASTERS[model];

  export const schema = <Model extends ILlmApplication.Model>(model: Model) =>
    SCHEMA_CASTERS[model];

  export const defaultConfig = <Model extends ILlmApplication.Model>(
    model: Model,
  ) => DEFAULT_CONFIGS[model];
}

const PARAMETERS_CASTERS = {
  chatgpt: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    config: IChatGptSchema.IConfig;
  }) => ChatGptConverter.parameters(props),
  claude: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    config: IClaudeSchema.IConfig;
  }) => ClaudeConverter.parameters(props),
  gemini: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    config: IGeminiSchema.IConfig;
  }) => GeminiConverter.parameters(props),
  "3.0": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    config: ILlmSchemaV3.IConfig;
  }) => LlmConverterV3.parameters(props),
  "3.1": (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    config: ILlmSchemaV3_1.IConfig;
  }) => LlmConverterV3_1.parameters(props),
};

const SCHEMA_CASTERS = {
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
  claude: (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    $defs: Record<string, IClaudeSchema>;
    config: IClaudeSchema.IConfig;
  }) =>
    ClaudeConverter.schema({
      components: props.components,
      schema: props.schema,
      $defs: props.$defs,
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
};

const DEFAULT_CONFIGS = {
  chatgpt: {
    constraint: false,
    reference: false,
  } satisfies IChatGptSchema.IConfig,
  claude: {
    reference: false,
  } satisfies IClaudeSchema.IConfig,
  gemini: {
    recursive: 3,
  } satisfies IGeminiSchema.IConfig,
  "3.0": {
    constraint: false,
    recursive: 3,
  } satisfies ILlmSchemaV3.IConfig,
  "3.1": {
    constraint: false,
    reference: false,
  } satisfies ILlmSchemaV3_1.IConfig,
};
