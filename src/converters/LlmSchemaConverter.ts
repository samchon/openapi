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
  chatgpt: (props: Parameters<typeof ChatGptConverter.parameters>[0]) =>
    ChatGptConverter.parameters(props),
  claude: (props: Parameters<typeof ClaudeConverter.parameters>[0]) =>
    ClaudeConverter.parameters(props),
  gemini: (props: Parameters<typeof GeminiConverter.parameters>[0]) =>
    GeminiConverter.parameters(props),
  llama: (props: Parameters<typeof LlamaConverter.parameters>[0]) =>
    LlamaConverter.parameters(props),
  "3.0": (props: Parameters<typeof LlmConverterV3.parameters>[0]) =>
    LlmConverterV3.parameters(props),
  "3.1": (props: Parameters<typeof LlmConverterV3_1.parameters>[0]) =>
    LlmConverterV3_1.parameters(props),
};

const SCHEMA_CASTERS = {
  chatgpt: (props: Parameters<typeof ChatGptConverter.schema>[0]) =>
    ChatGptConverter.schema(props),
  claude: (props: Parameters<typeof ClaudeConverter.schema>[0]) =>
    ClaudeConverter.schema(props),
  gemini: (props: Parameters<typeof GeminiConverter.schema>[0]) =>
    GeminiConverter.schema(props),
  llama: (props: Parameters<typeof LlamaConverter.schema>[0]) =>
    LlamaConverter.schema(props),
  "3.0": (props: Parameters<typeof LlmConverterV3.schema>[0]) =>
    LlmConverterV3.schema(props),
  "3.1": (props: Parameters<typeof LlmConverterV3_1.schema>[0]) =>
    LlmConverterV3_1.schema(props),
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
    constraint: true,
    recursive: 3,
  } satisfies ILlmSchemaV3.IConfig,
  "3.1": {
    constraint: true,
    reference: false,
  } satisfies ILlmSchemaV3_1.IConfig,
};
