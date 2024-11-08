import { ILlmFunction } from "./ILlmFunction";
import { ILlmSchema } from "./ILlmSchema";

/**
 * Application of LLM function calling.
 *
 * `ILlmApplication` is a data structure representing a collection of
 * {@link ILlmFunction LLM function calling schemas}, composed from a native
 * TypeScript class (or interface) type by the `typia.llm.application<App>()`
 * function.
 *
 * By the way, the LLM function calling application composition, converting
 * `ILlmApplication` instance from TypeScript interface (or class) type is not always
 * successful. As LLM provider like OpenAI cannot understand the recursive reference
 * type that is embodied by {@link OpenApi.IJsonSchema.IReference}, if there're some
 * recursive types in the TypeScript interface (or class) type, the conversion would
 * be failed.
 *
 * Also, there can be some parameters (or their nested properties) which must be
 * composed by Human, not by LLM. File uploading feature or some sensitive information
 * like secrety key (password) are the examples. In that case, you can separate the
 * function parameters to both LLM and human sides by configuring the
 * {@link ILlmApplication.IOptions.separate} property. The separated parameters are
 * assigned to the {@link ILlmFunction.separated} property.
 *
 * For reference, when both LLM and Human filled parameter values to call, you can
 * merge them by calling the {@link HttpLlm.mergeParameters} function. In other words,
 * if you've configured the {@link ILlmApplication.IOptions.separate} property, you
 * have to merge the separated parameters before the funtion call execution.
 *
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface ILlmApplication<Schema extends ILlmSchema = ILlmSchema> {
  /**
   * List of function metadata.
   *
   * List of function metadata that can be used for the LLM function call.
   */
  functions: ILlmFunction<Schema>[];

  /**
   * Options for the application.
   */
  options: ILlmApplication.IOptions<Schema>;
}
export namespace ILlmApplication {
  /**
   * Options for composing the LLM application.
   */
  export interface IOptions<Schema extends ILlmSchema = ILlmSchema> {
    /**
     * Whether to allow recursive types or not.
     *
     * If allow, then how many times to repeat the recursive types.
     *
     * @default 3
     */
    recursive: false | number;

    /**
     * Separator function for the parameters.
     *
     * When composing parameter arguments through LLM function call,
     * there can be a case that some parameters must be composed by human,
     * or LLM cannot understand the parameter. For example, if the
     * parameter type has configured
     * {@link ILlmSchema.IString.contentMediaType} which indicates file
     * uploading, it must be composed by human, not by LLM
     * (Large Language Model).
     *
     * In that case, if you configure this property with a function that
     * predicating whether the schema value must be composed by human or
     * not, the parameters would be separated into two parts.
     *
     * - {@link ILlmFunction.separated.llm}
     * - {@link ILlmFunction.separated.human}
     *
     * When writing the function, note that returning value `true` means
     * to be a human composing the value, and `false` means to LLM
     * composing the value. Also, when predicating the schema, it would
     * better to utilize the {@link LlmTypeChecker} features.
     *
     * @param schema Schema to be separated.
     * @returns Whether the schema value must be composed by human or not.
     * @default null
     */
    separate: null | ((schema: Schema) => boolean);
  }
}
