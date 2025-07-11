import { ILlmFunction } from "./ILlmFunction";
import { ILlmSchema } from "./ILlmSchema";

/**
 * Application of LLM function calling.
 *
 * `ILlmApplication` is a data structure representing a collection of
 * {@link ILlmFunction LLM function calling schemas}, composed from a native
 * TypeScript class (or interface) type by the `typia.llm.application<App,
 * Model>()` function.
 *
 * Also, there can be some parameters (or their nested properties) which must be
 * composed by Human, not by LLM. File uploading feature or some sensitive
 * information like secret key (password) are the examples. In that case, you
 * can separate the function parameters to both LLM and human sides by
 * configuring the {@link ILlmApplication.IOptions.separate} property. The
 * separated parameters are assigned to the {@link ILlmFunction.separated}
 * property.
 *
 * For reference, when both LLM and Human filled parameter values to call, you
 * can merge them by calling the {@link HttpLlm.mergeParameters} function. In
 * other words, if you've configured the
 * {@link ILlmApplication.IOptions.separate} property, you have to merge the
 * separated parameters before the function call execution.
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @reference https://platform.openai.com/docs/guides/function-calling
 */
export interface ILlmApplication<
  Model extends ILlmSchema.Model,
  Class extends object = any,
> {
  /** Model of the LLM. */
  model: Model;

  /**
   * List of function metadata.
   *
   * List of function metadata that can be used for the LLM function call.
   */
  functions: ILlmFunction<Model>[];

  /** Configuration for the application. */
  options: ILlmApplication.IOptions<Model>;

  /**
   * Class type, the source of the LLM application.
   *
   * This property is just for the generic type inference, and its value is
   * always `undefined`.
   */
  __class?: Class | undefined;
}
export namespace ILlmApplication {
  /** Options for application composition. */
  export type IOptions<Model extends ILlmSchema.Model> = {
    /**
     * Separator function for the parameters.
     *
     * When composing parameter arguments through LLM function call, there can
     * be a case that some parameters must be composed by human, or LLM cannot
     * understand the parameter.
     *
     * For example, if the parameter type has configured
     * {@link IGeminiSchema.IString.contentMediaType} which indicates file
     * uploading, it must be composed by human, not by LLM (Large Language
     * Model).
     *
     * In that case, if you configure this property with a function that
     * predicating whether the schema value must be composed by human or not,
     * the parameters would be separated into two parts.
     *
     * - {@link ILlmFunction.separated.llm}
     * - {@link ILlmFunction.separated.human}
     *
     * When writing the function, note that returning value `true` means to be a
     * human composing the value, and `false` means to LLM composing the value.
     * Also, when predicating the schema, it would better to utilize the
     * {@link GeminiTypeChecker} like features.
     *
     * @default null
     * @param schema Schema to be separated.
     * @returns Whether the schema value must be composed by human or not.
     */
    separate: null | ((schema: ILlmSchema.ModelSchema[Model]) => boolean);
  } & ILlmSchema.ModelConfig[Model];
}
