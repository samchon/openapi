/**
 * Common attributes for JSON schema types.
 *
 * `IJsonSchemaAttribute` is a common interface for all JSON schema types
 * supported in here `@samchon/openapi`. Here is the list of affected JSON
 * schema types in `@samchon/openapi`, and you can extend the interface by
 * declaring module augmentation.
 *
 * - {@link OpenApi.IJsonSchema}
 * - {@link IChatGptSchema}
 * - {@link IClaudeSchema}
 * - {@link IGeminiSchema}
 * - {@link ILlmSchemaV3}
 * - {@link ILlmSchemaV3_1}
 *
 * For example, if you extend the `IJsonSchemaAttribute` interface like
 * below, every JSON schema types in `@samchon/openapi` will have a new
 * custom attribute `x-wrtn-placeholder`.
 *
 * ```typescript
 * declare module "@samchon/openapi" {
 *   export interface IJsonSchemaAttribute {
 *     /// Placeholder value for frontend application
 *     ///
 *     /// Placeholder ia label shown in the input field as a hint.
 *     /// For example, when an email input field exists, the label
 *     /// value would be "Insert your email address here".
 *     "x-wrtn-placeholder"?: string;
 *   }
 * }
 * ```
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IJsonSchemaAttribute {
  /**
   * Title of the schema.
   */
  title?: string;

  /**
   * Detailed description of the schema.
   */
  description?: string;

  /**
   * Whether the type is deprecated or not.
   */
  deprecated?: boolean;

  /**
   * Example value.
   */
  example?: any;

  /**
   * List of example values as key-value pairs.
   */
  examples?: Record<string, any>;
}
