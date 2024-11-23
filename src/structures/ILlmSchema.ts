import { IChatGptSchema } from "./IChatGptSchema";
import { IGeminiSchema } from "./IGeminiSchema";
import { ILlmSchemaV3 } from "./ILlmSchemaV3";
import { ILlmSchemaV3_1 } from "./ILlmSchemaV3_1";

/**
 * The schemas for the LLM function calling.
 *
 * `ILlmSchema` is an union type collecting all the schemas for the
 * LLM function calling.
 *
 * Select a proper schema type according to the LLM provider you're using.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export type ILlmSchema =
  | IChatGptSchema
  | IGeminiSchema
  | ILlmSchemaV3
  | ILlmSchemaV3_1;

export namespace ILlmSchema {
  export type IParameters =
    | IChatGptSchema.IParameters
    | IGeminiSchema.IParameters
    | ILlmSchemaV3.IParameters
    | ILlmSchemaV3_1.IParameters;

  export type IConfig =
    | IChatGptSchema.IConfig
    | IGeminiSchema.IConfig
    | ILlmSchemaV3.IConfig
    | ILlmSchemaV3_1.IConfig;
}
