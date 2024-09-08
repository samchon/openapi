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
export interface ILlmFunction<Schema extends ILlmSchema = ILlmSchema> {
  /**
   * Representative name of the function.
   */
  name: string;

  /**
   * List of parameter types.
   */
  parameters: Schema[];

  /**
   * Collection of separated parameters.
   */
  separated?: ILlmFunction.ISeparated<Schema>;

  /**
   * Expected return type.
   *
   * If the function returns nothing (`void`), the `output` value would
   * be `undefined`.
   */
  output?: Schema | undefined;

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
}
export namespace ILlmFunction {
  /**
   * Collection of separated parameters.
   */
  export interface ISeparated<Schema extends ILlmSchema = ILlmSchema> {
    /**
     * Parameters that would be composed by the LLM.
     */
    llm: ISeparatedParameter<Schema>[];

    /**
     * Parameters that would be composed by the human.
     */
    human: ISeparatedParameter<Schema>[];
  }

  /**
   * Separated parameter.
   */
  export interface ISeparatedParameter<Schema extends ILlmSchema = ILlmSchema> {
    /**
     * Index of the parameter.
     *
     * @type uint
     */
    index: number;

    /**
     * Type schema info of the parameter.
     */
    schema: Schema;
  }
}
