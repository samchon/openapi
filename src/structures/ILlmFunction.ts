import { ILlmSchema } from "./ILlmSchema";
import { IValidation } from "./IValidation";

/**
 * LLM function metadata.
 *
 * `ILlmFunction` is an interface representing a function metadata, which has
 * been used for the LLM (Language Large Model) function calling. Also, it's a
 * function structure containing the function {@link name}, {@link parameters} and
 * {@link output return type}.
 *
 * If you provide this `ILlmFunction` data to the LLM provider like "OpenAI",
 * the "OpenAI" will compose a function arguments by analyzing conversations
 * with the user. With the LLM composed arguments, you can execute the function
 * and get the result.
 *
 * By the way, do not ensure that LLM will always provide the correct arguments.
 * The LLM of present age is not perfect, so that you would better to validate
 * the arguments before executing the function. I recommend you to validate the
 * arguments before execution by using
 * [`typia`](https://github.com/samchon/typia) library.
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @template Model Type of the LLM model
 * @reference https://platform.openai.com/docs/guides/function-calling
 */
export interface ILlmFunction<Model extends ILlmSchema.Model> {
  /**
   * Representative name of the function.
   *
   * @maxLength 64
   */
  name: string;

  /** List of parameter types. */
  parameters: ILlmSchema.ModelParameters[Model];

  /**
   * Collection of separated parameters.
   *
   * Filled only when {@link ILlmApplication.IOptions.separate} is configured.
   */
  separated?: ILlmFunction.ISeparated<Model>;

  /**
   * Expected return type.
   *
   * If the function returns nothing (`void`), the `output` value would be
   * `undefined`.
   */
  output?: ILlmSchema.ModelSchema[Model];

  /**
   * Description of the function.
   *
   * For reference, the `description` is very important property to teach the
   * purpose of the function to the LLM (Language Large Model), and LLM actually
   * determines which function to call by the description.
   *
   * Also, when the LLM conversates with the user, the `description` is used to
   * explain the function to the user. Therefore, the `description` property has
   * the highest priority, and you have to consider it.
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
  tags?: string[] | undefined;

  /**
   * Validate function of the arguments.
   *
   * You know what? LLM (Large Language Model) like OpenAI takes a lot of
   * mistakes when composing arguments in function calling. Even though `number`
   * like simple type is defined in the {@link parameters} schema, LLM often
   * fills it just by a `string` typed value.
   *
   * In that case, you have to give a validation feedback to the LLM by using
   * this `validate` function. The `validate` function will return detailed
   * information about every type errors about the arguments.
   *
   * And in my experience, OpenAI's `gpt-4o-mini` model tends to construct an
   * invalid function calling arguments at the first trial about 50% of the
   * time. However, if correct it through this `validate` function, the success
   * rate soars to 99% at the second trial, and I've never failed at the third
   * trial.
   *
   * > If you've {@link separated} parameters, use the
   * > {@link ILlmFunction.ISeparated.validate} function instead when validating
   * > the LLM composed arguments.
   *
   * > In that case, This `validate` function would be meaningful only when you've
   * > merged the LLM and human composed arguments by
   * > {@link HttpLlm.mergeParameters} function.
   *
   * @param args Arguments to validate
   * @returns Validation result
   */
  validate: (args: unknown) => IValidation<unknown>;
}
export namespace ILlmFunction {
  /** Collection of separated parameters. */
  export interface ISeparated<Model extends ILlmSchema.Model> {
    /**
     * Parameters that would be composed by the LLM.
     *
     * Even though no property exists in the LLM side, the `llm` property would
     * have at least empty object type.
     */
    llm: ILlmSchema.ModelParameters[Model];

    /** Parameters that would be composed by the human. */
    human: ILlmSchema.ModelParameters[Model] | null;

    /**
     * Validate function of the separated arguments.
     *
     * If LLM part of separated parameters has some properties, this `validate`
     * function will be filled for the {@link llm} type validation.
     *
     * > You know what? LLM (Large Language Model) like OpenAI takes a lot of
     * > mistakes when composing arguments in function calling. Even though
     * > `number` like simple type is defined in the {@link parameters} schema, LLM
     * > often fills it just by a `string` typed value.
     *
     * > In that case, you have to give a validation feedback to the LLM by using
     * > this `validate` function. The `validate` function will return detailed
     * > information about every type errors about the arguments.
     *
     * > And in my experience, OpenAI's `gpt-4o-mini` model tends to construct an
     * > invalid function calling arguments at the first trial about 50% of the
     * > time. However, if correct it through this `validate` function, the
     * > success rate soars to 99% at the second trial, and I've never failed at
     * > the third trial.
     *
     * @param args Arguments to validate
     * @returns Validate result
     */
    validate?: ((args: unknown) => IValidation<unknown>) | undefined;
  }
}
