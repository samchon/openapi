import { ILlmFunction } from "./ILlmFunction";
import { ILlmSchema } from "./ILlmSchema";

export interface ILlmApplication<Schema extends ILlmSchema = ILlmSchema> {
  /**
   * List of function metadata.
   *
   * List of function metadata that can be used for the LLM function call.
   */
  functions: ILlmFunction<Schema>[];

  /**
   * Options for the document.
   */
  options: ILlmApplication.IOptions<Schema>;
}
export namespace ILlmApplication {
  export interface IOptions<Schema extends ILlmSchema = ILlmSchema> {
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
