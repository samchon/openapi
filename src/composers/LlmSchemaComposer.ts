import { IChatGptSchema } from "../structures/IChatGptSchema";
import { IClaudeSchema } from "../structures/IClaudeSchema";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { ILlamaSchema } from "../structures/ILlamaSchema";
import { ILlmSchema } from "../structures/ILlmSchema";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { ChatGptTypeChecker } from "../utils/ChatGptTypeChecker";
import { ClaudeTypeChecker } from "../utils/ClaudeTypeChecker";
import { GeminiTypeChecker } from "../utils/GeminiTypeChecker";
import { LlamaTypeChecker } from "../utils/LlamaTypeChecker";
import { LlmTypeCheckerV3 } from "../utils/LlmTypeCheckerV3";
import { LlmTypeCheckerV3_1 } from "../utils/LlmTypeCheckerV3_1";
import { ChatGptSchemaComposer } from "./llm/ChatGptSchemaComposer";
import { ClaudeSchemaComposer } from "./llm/ClaudeSchemaComposer";
import { GeminiSchemaComposer } from "./llm/GeminiSchemaComposer";
import { LlamaSchemaComposer } from "./llm/LlamaSchemaComposer";
import { LlmSchemaV3Composer } from "./llm/LlmSchemaV3Composer";
import { LlmSchemaV3_1Composer } from "./llm/LlmSchemaV3_1Composer";

export namespace LlmSchemaComposer {
  export const parameters = <Model extends ILlmSchema.Model>(model: Model) =>
    PARAMETERS_CASTERS[model];

  export const schema = <Model extends ILlmSchema.Model>(model: Model) =>
    SCHEMA_CASTERS[model];

  export const defaultConfig = <Model extends ILlmSchema.Model>(model: Model) =>
    DEFAULT_CONFIGS[model];

  export const typeChecker = <Model extends ILlmSchema.Model>(model: Model) =>
    TYPE_CHECKERS[model];

  export const separateParameters = <Model extends ILlmSchema.Model>(
    model: Model,
  ) => SEPARATE_PARAMETERS[model];
}

const PARAMETERS_CASTERS = {
  chatgpt: ChatGptSchemaComposer.parameters,
  claude: ClaudeSchemaComposer.parameters,
  gemini: GeminiSchemaComposer.parameters,
  llama: LlamaSchemaComposer.parameters,
  "3.0": LlmSchemaV3Composer.parameters,
  "3.1": LlmSchemaV3_1Composer.parameters,
};

const SCHEMA_CASTERS = {
  chatgpt: ChatGptSchemaComposer.schema,
  claude: ClaudeSchemaComposer.schema,
  gemini: GeminiSchemaComposer.schema,
  llama: LlamaSchemaComposer.schema,
  "3.0": LlmSchemaV3Composer.schema,
  "3.1": LlmSchemaV3_1Composer.schema,
};

const SEPARATE_PARAMETERS = {
  chatgpt: ChatGptSchemaComposer.separateParameters,
  claude: ClaudeSchemaComposer.separateParameters,
  gemini: GeminiSchemaComposer.separateParameters,
  llama: LlamaSchemaComposer.separateParameters,
  "3.0": LlmSchemaV3Composer.separateParameters,
  "3.1": LlmSchemaV3_1Composer.separateParameters,
};

const DEFAULT_CONFIGS = {
  chatgpt: {
    reference: false,
    strict: false,
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

const TYPE_CHECKERS = {
  chatgpt: ChatGptTypeChecker,
  claude: ClaudeTypeChecker,
  gemini: GeminiTypeChecker,
  llama: LlamaTypeChecker,
  "3.0": LlmTypeCheckerV3,
  "3.1": LlmTypeCheckerV3_1,
};
