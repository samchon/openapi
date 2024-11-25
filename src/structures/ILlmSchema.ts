import { ILlmApplication } from "./ILlmApplication";

/**
 * The schemas for the LLM function calling.
 *
 * `ILlmSchema` is an union type collecting every the schemas for the
 * LLM function calling.
 *
 * Select a proper schema type according to the LLM provider you're using.
 *
 * @template Model Name of the target LLM model
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @reference https://platform.openai.com/docs/guides/structured-outputs
 * @author Jeongho Nam - https://github.com/samchon
 */
export type ILlmSchema<
  Model extends ILlmApplication.Model = ILlmApplication.Model,
> = ILlmApplication.ModelSchema[Model];

export namespace ILlmSchema {
  /**
   * Type of function parameters.
   *
   * `ILlmSchema.IParameters` is a type defining a function's pamameters
   * as a keyworded object type.
   *
   * It also can be utilized for the structured output metadata.
   *
   * @reference https://platform.openai.com/docs/guides/structured-outputs
   */
  export type IParameters<
    Model extends ILlmApplication.Model = ILlmApplication.Model,
  > = ILlmApplication.ModelParameters[Model];

  /**
   * Configuration for the LLM schema composition.
   */
  export type IConfig<
    Model extends ILlmApplication.Model = ILlmApplication.Model,
  > = ILlmApplication.ModelConfig[Model];
}
