import { IChatGptSchema } from "./IChatGptSchema";
import { IClaudeSchema } from "./IClaudeSchema";
import { IGeminiSchema } from "./IGeminiSchema";
import { ILlmSchemaV3 } from "./ILlmSchemaV3";
import { ILlmSchemaV3_1 } from "./ILlmSchemaV3_1";

/**
 * The schemas for the LLM function calling.
 *
 * `ILlmSchema` is a union type collecting every schema for LLM function calling.
 * Select a proper schema type according to the LLM provider you're using.
 *
 * {@link IChatGptSchema} is designed for OpenAI models. When using OpenAI's strict
 * mode, it handles restrictions by utilizing JSDoc tags in the `description`
 * property to support full JSON schema specifications despite OpenAI's constraints.
 *
 * {@link IClaudeSchema} is the most recommended option as it most closely follows
 * the JSON schema standard with the most concise types and accurate expressions.
 * Claude has no JSON schema specification restrictions, making it ideal when
 * you're unsure about your AI model's requirements.
 *
 * {@link IGeminiSchema} is implemented according to the Gemini guide documentation.
 * Prior to November 2025, it had severe limitations, but now supports nearly all
 * JSON schema specifications.
 *
 * {@link ILlmSchemaV3} and {@link ILlmSchemaV3_1} are middle layer schemas for
 * advanced users who need direct control over OpenAPI v3.0 or v3.1 specifications.
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @template Model Type of the LLM model
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @reference https://platform.openai.com/docs/guides/structured-outputs
 */
export type ILlmSchema<Model extends ILlmSchema.Model = ILlmSchema.Model> =
  ILlmSchema.ModelSchema[Model];

export namespace ILlmSchema {
  export type Model = "chatgpt" | "claude" | "gemini" | "3.0" | "3.1";
  export interface ModelConfig {
    chatgpt: IChatGptSchema.IConfig;
    claude: IClaudeSchema.IConfig;
    gemini: IGeminiSchema.IConfig;
    "3.0": ILlmSchemaV3.IConfig;
    "3.1": ILlmSchemaV3_1.IConfig;
  }
  export interface ModelParameters {
    chatgpt: IChatGptSchema.IParameters;
    claude: IClaudeSchema.IParameters;
    gemini: IGeminiSchema.IParameters;
    "3.0": ILlmSchemaV3.IParameters;
    "3.1": ILlmSchemaV3_1.IParameters;
  }
  export interface ModelSchema {
    chatgpt: IChatGptSchema;
    claude: IClaudeSchema;
    gemini: IGeminiSchema;
    "3.0": ILlmSchemaV3;
    "3.1": ILlmSchemaV3_1;
  }

  /**
   * Type of function parameters.
   *
   * `ILlmSchema.IParameters` is a type defining a function's parameters as a
   * keyworded object type.
   *
   * It also can be utilized for the structured output metadata.
   *
   * @reference https://platform.openai.com/docs/guides/structured-outputs
   */
  export type IParameters<Model extends ILlmSchema.Model = ILlmSchema.Model> =
    ILlmSchema.ModelParameters[Model];

  /** Configuration for the LLM schema composition. */
  export type IConfig<Model extends ILlmSchema.Model = ILlmSchema.Model> =
    ILlmSchema.ModelConfig[Model];
}
