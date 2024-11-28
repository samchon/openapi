import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { IClaudeSchema } from "../structures/IClaudeSchema";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { ILlamaSchema } from "../structures/ILlamaSchema";
import { ILlmSchema } from "../structures/ILlmSchema";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { ChatGptConverter } from "./ChatGptConverter";
import { ClaudeConverter } from "./ClaudeConverter";
import { GeminiConverter } from "./GeminiConverter";
import { LlamaConverter } from "./LlamaConverter";
import { LlmConverterV3 } from "./LlmConverterV3";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace LlmSchemaConverter {
  export const parameters = <Model extends ILlmSchema.Model>(model: Model) =>
    PARAMETERS_CASTERS[model];

  export const schema = <Model extends ILlmSchema.Model>(model: Model) =>
    SCHEMA_CASTERS[model];

  export const defaultConfig = <Model extends ILlmSchema.Model>(model: Model) =>
    DEFAULT_CONFIGS[model];
}

const PARAMETERS_CASTERS = {
  chatgpt: (props: {
    config: IChatGptSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }) => ChatGptConverter.parameters(props),
  claude: (props: {
    config: IClaudeSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }) => ClaudeConverter.parameters(props),
  gemini: (props: {
    config: IGeminiSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }) => GeminiConverter.parameters(props),
  llama: (props: {
    config: ILlamaSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }) => LlamaConverter.parameters(props),
  "3.0": (props: {
    config: ILlmSchemaV3.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }) => LlmConverterV3.parameters(props),
  "3.1": (props: {
    config: ILlmSchemaV3_1.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }) => LlmConverterV3_1.parameters(props),
};

const SCHEMA_CASTERS = {
  chatgpt: (props: {
    config: IChatGptSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    $defs: Record<string, IChatGptSchema>;
  }) =>
    ChatGptConverter.schema({
      components: props.components,
      schema: props.schema,
      $defs: props.$defs,
      config: props.config,
    }),
  claude: (props: {
    config: IClaudeSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    $defs: Record<string, IClaudeSchema>;
  }) =>
    ClaudeConverter.schema({
      components: props.components,
      schema: props.schema,
      $defs: props.$defs,
      config: props.config,
    }),
  gemini: (props: {
    config: IGeminiSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }) =>
    GeminiConverter.schema({
      components: props.components,
      schema: props.schema,
      config: props.config,
    }),
  llama: (props: {
    config: ILlamaSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    $defs: Record<string, ILlamaSchema>;
  }) =>
    LlamaConverter.schema({
      components: props.components,
      schema: props.schema,
      $defs: props.$defs,
      config: props.config,
    }),
  "3.0": (props: {
    config: ILlmSchemaV3.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }) =>
    LlmConverterV3.schema({
      components: props.components,
      schema: props.schema,
      config: props.config,
    }),
  "3.1": (props: {
    config: ILlmSchemaV3_1.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    $defs: Record<string, ILlmSchemaV3_1>;
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
    reference: false,
  } satisfies IChatGptSchema.IConfig,
  claude: {
    reference: false,
  } satisfies IClaudeSchema.IConfig,
  gemini: {
    recursive: 3,
  } satisfies IGeminiSchema.IConfig,
  llama: {
    reference: false,
  } satisfies ILlamaSchema.IConfig,
  "3.0": {
    constraint: false,
    recursive: 3,
  } satisfies ILlmSchemaV3.IConfig,
  "3.1": {
    constraint: false,
    reference: false,
  } satisfies ILlmSchemaV3_1.IConfig,
};
