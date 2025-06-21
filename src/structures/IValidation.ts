/**
 * Union type representing the result of type validation
 *
 * This is the return type of {@link typia.validate} functions, returning
 * {@link IValidation.ISuccess} on validation success and
 * {@link IValidation.IFailure} on validation failure. When validation fails, it
 * provides detailed, granular error information that precisely describes what
 * went wrong, where it went wrong, and what was expected.
 *
 * This comprehensive error reporting makes `IValidation` particularly valuable
 * for AI function calling scenarios, where Large Language Models (LLMs) need
 * specific feedback to correct their parameter generation. The detailed error
 * information is used by ILlmFunction.validate() to provide validation feedback
 * to AI agents, enabling iterative correction and improvement of function
 * calling accuracy.
 *
 * This type uses the Discriminated Union pattern, allowing type specification
 * through the success property:
 *
 * ```typescript
 * const result = typia.validate<string>(input);
 * if (result.success) {
 *   // IValidation.ISuccess<string> type
 *   console.log(result.data); // validated data accessible
 * } else {
 *   // IValidation.IFailure type
 *   console.log(result.errors); // detailed error information accessible
 * }
 * ```
 *
 * @author Jeongho Nam - https://github.com/samchon
 * @template T The type to validate
 */
export type IValidation<T = unknown> =
  | IValidation.ISuccess<T>
  | IValidation.IFailure;

export namespace IValidation {
  /**
   * Interface returned when type validation succeeds
   *
   * Returned when the input value perfectly conforms to the specified type T.
   * Since success is true, TypeScript's type guard allows safe access to the
   * validated data through the data property.
   *
   * @template T The validated type
   */
  export interface ISuccess<T = unknown> {
    /** Indicates validation success */
    success: true;

    /** The validated data of type T */
    data: T;
  }

  /**
   * Interface returned when type validation fails
   *
   * Returned when the input value does not conform to the expected type.
   * Contains comprehensive error information designed to be easily understood
   * by both humans and AI systems. Each error in the errors array provides
   * precise details about validation failures, including the exact path to the
   * problematic property, what type was expected, and what value was actually
   * provided.
   *
   * This detailed error structure is specifically optimized for AI function
   * calling validation feedback. When LLMs make type errors during function
   * calling, these granular error reports enable the AI to understand exactly
   * what went wrong and how to fix it, improving success rates in subsequent
   * attempts.
   *
   * Example error scenarios:
   *
   * - Type mismatch: expected "string" but got number 5
   * - Format violation: expected "string & Format<'uuid'>" but got
   *   "invalid-format"
   * - Missing properties: expected "required property 'name'" but got undefined
   * - Array type errors: expected "Array<string>" but got single string value
   *
   * The errors are used by ILlmFunction.validate() to provide structured
   * feedback to AI agents, enabling them to correct their parameter generation
   * and achieve improved function calling accuracy.
   */
  export interface IFailure {
    /** Indicates validation failure */
    success: false;

    /** The original input data that failed validation */
    data: unknown;

    /** Array of detailed validation errors */
    errors: IError[];
  }

  /**
   * Detailed information about a specific validation error
   *
   * Each error provides granular, actionable information about validation
   * failures, designed to be immediately useful for both human developers and
   * AI systems. The error structure follows a consistent format that enables
   * precise identification and correction of type mismatches.
   *
   * This error format is particularly valuable for AI function calling
   * scenarios, where LLMs need to understand exactly what went wrong to
   * generate correct parameters. The combination of path, expected type, and
   * actual value provides the AI with sufficient context to make accurate
   * corrections, which is why ILlmFunction.validate() can achieve such high
   * success rates in validation feedback loops.
   *
   * Real-world examples from AI function calling:
   *
   *     {
   *       path: "input.member.age",
   *       expected: "number & Format<'uint32'>",
   *       value: 20.75  // AI provided float instead of uint32
   *     }
   *
   *     {
   *       path: "input.categories",
   *       expected: "Array<string>",
   *       value: "technology"  // AI provided string instead of array
   *     }
   *
   *     {
   *       path: "input.id",
   *       expected: "string & Format<'uuid'>",
   *       value: "invalid-uuid-format"  // AI provided malformed UUID
   *     }
   */
  export interface IError {
    /**
     * The path to the property that failed validation (e.g.,
     * "input.member.age")
     */
    path: string;

    /** Description of the expected type or format */
    expected: string;

    /** The actual value that caused the validation failure */
    value: any;
  }
}
