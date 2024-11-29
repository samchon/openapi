import { ILlmSchema } from "./ILlmSchema";

/**
 * LLM function metadata.
 *
 * `ILlmFunction` is an interface representing a function metadata,
 * which has been used for the LLM (Language Large Model) function
 * calling. Also, it's a function structure containing the function
 * {@link name}, {@link parameters} and {@link output return type}.
 *
 * If you provide this `ILlmFunction` data to the LLM provider like "OpenAI",
 * the "OpenAI" will compose a function arguments by analyzing conversations
 * with the user. With the LLM composed arguments, you can execute the function
 * and get the result.
 *
 * By the way, do not ensure that LLM will always provide the correct
 * arguments. The LLM of present age is not perfect, so that you would
 * better to validate the arguments before executing the function.
 * I recommend you to validate the arguments before execution by using
 * [`typia`](https://github.com/samchon/typia) library.
 *
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface ILlmFunction<Model extends ILlmSchema.Model> {
  /**
   * Representative name of the function.
   */
  name: string;

  /**
   * List of parameter types.
   */
  parameters: ILlmSchema.ModelParameters[Model];

  /**
   * Collection of separated parameters.
   */
  separated?: ILlmFunction.ISeparated<Model>;

  /**
   * Expected return type.
   *
   * If the function returns nothing (`void`), the `output` value would
   * be `undefined`.
   */
  output?: ILlmSchema.ModelSchema[Model];

  /**
   * Whether the function schema types are strict or not.
   *
   * Newly added specification to "OpenAI" at 2024-08-07.
   *
   * @reference https://openai.com/index/introducing-structured-outputs-in-the-api/
   */
  strict: true;

  /**
   * Description of the function.
   *
   * For reference, the `description` is very important property to teach
   * the purpose of the function to the LLM (Language Large Model), and
   * LLM actually determines which function to call by the description.
   *
   * Also, when the LLM conversates with the user, the `description` is
   * used to explain the function to the user. Therefore, the `description`
   * property has the highest priroity, and you have to consider it.
   */
  description?: string | undefined;

  /**
   * Whether the function is deprecated or not.
   *
   * If the `deprecated` is `true`, the function is not recommended to use.
   *
   * LLM (Large Language Model) may not use the deprecated function.
   */
  deprecated?: boolean | undefined;

  /**
   * Category tags for the function.
   *
   * You can fill this property by the `@tag ${name}` comment tag.
   */
  tags?: string[];
}
export namespace ILlmFunction {
  /**
   * Collection of separated parameters.
   */
  export interface ISeparated<Model extends ILlmSchema.Model> {
    /**
     * Parameters that would be composed by the LLM.
     */
    llm: ILlmSchema.ModelParameters[Model] | null;

    /**
     * Parameters that would be composed by the human.
     */
    human: ILlmSchema.ModelParameters[Model] | null;
  }
}
