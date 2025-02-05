import { OpenApi } from "../OpenApi";
import { IHttpMigrateRoute } from "./IHttpMigrateRoute";
import { ILlmSchema } from "./ILlmSchema";

/**
 * LLM function calling schema from HTTP (OpenAPI) operation.
 *
 * `IHttpLlmFunction` is a data structure representing a function converted
 * from the {@link OpenApi.IOperation OpenAPI operation}, used for the LLM
 * (Large Language Model) function calling. It's a typical RPC (Remote Procedure Call)
 * structure containing the function {@link name}, {@link parameters}, and
 * {@link output return type}.
 *
 * If you provide this `IHttpLlmFunction` data to the LLM provider like "OpenAI",
 * the "OpenAI" will compose a function arguments by analyzing conversations with
 * the user. With the LLM composed arguments, you can execute the function through
 * {@link LlmFetcher.execute} and get the result.
 *
 * For reference, different between `IHttpLlmFunction` and its origin source
 * {@link OpenApi.IOperation} is, `IHttpLlmFunction` has converted every type schema
 * information from {@link OpenApi.IJsonSchema} to {@link ILlmSchemaV3} to escape
 * {@link OpenApi.IJsonSchema.IReference reference types}, and downgrade the version
 * of the JSON schema to OpenAPI 3.0. It's because LLM function call feature cannot
 * understand both reference types and OpenAPI 3.1 specification.
 *
 * Additionally, the properties' rule is:
 *
 * - `pathParameters`: Path parameters of {@link OpenApi.IOperation.parameters}
 * - `query`: Query parameter of {@link IHttpMigrateRoute.query}
 * - `body`: Body parameter of {@link IHttpMigrateRoute.body}
 *
 * ```typescript
 * {
 *   ...pathParameters,
 *   query,
 *   body,
 * }
 * ```
 *
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IHttpLlmFunction<Model extends ILlmSchema.Model> {
  /**
   * HTTP method of the endpoint.
   */
  method: "get" | "post" | "patch" | "put" | "delete";

  /**
   * Path of the endpoint.
   */
  path: string;

  /**
   * Representative name of the function.
   *
   * The `name` is a repsentative name identifying the function in the
   * {@link IHttpLlmApplication}. The `name` value is just composed by joining the
   * {@link IHttpMigrateRoute.accessor} by underscore `_` character.
   *
   * Here is the composition rule of the  {@link IHttpMigrateRoute.accessor}:
   *
   * > The `accessor` is composed with the following rules. At first,
   * > namespaces are composed by static directory names in the {@link path}.
   * > Parametric symbols represented by `:param` or `{param}` cannot be
   * > a part of the namespace.
   * >
   * > Instead, they would be a part of the function name. The function
   * > name is composed with the {@link method HTTP method} and parametric
   * > symbols like `getByParam` or `postByParam`. If there are multiple
   * > path parameters, they would be concatenated by `And` like
   * > `getByParam1AndParam2`.
   * >
   * > For refefence, if the {@link operation}'s {@link method} is `delete`,
   * > the function name would be replaced to `erase` instead of `delete`.
   * > It is the reason why the `delete` is a reserved keyword in many
   * > programming languages.
   * >
   * > - Example 1
   * >   - path: `POST /shopping/sellers/sales`
   * >   - accessor: `shopping.sellers.sales.post`
   * > - Example 2
   * >   - endpoint: `GET /shoppings/sellers/sales/:saleId/reviews/:reviewId/comments/:id
   * >   - accessor: `shoppings.sellers.sales.reviews.getBySaleIdAndReviewIdAndCommentId`
   *
   * @maxLength 64
   */
  name: string;

  /**
   * List of parameter types.
   *
   * If you've configured {@link IHttpLlmApplication.IOptions.keyword} as `true`,
   * number of {@link IHttpLlmFunction.parameters} are always 1 and the first
   * parameter's type is always {@link ILlmSchemaV3.IObject}. The
   * properties' rule is:
   *
   * - `pathParameters`: Path parameters of {@link IHttpMigrateRoute.parameters}
   * - `query`: Query parameter of {@link IHttpMigrateRoute.query}
   * - `body`: Body parameter of {@link IHttpMigrateRoute.body}
   *
   * ```typescript
   * {
   *   ...pathParameters,
   *   query,
   *   body,
   * }
   * ```
   *
   * Otherwise, the parameters would be multiple, and the sequence of the
   * parameters are following below rules:
   *
   * ```typescript
   * [
   *   ...pathParameters,
   *   ...(query ? [query] : []),
   *   ...(body ? [body] : []),
   * ]
   * ```
   */
  parameters: ILlmSchema.ModelParameters[Model];

  /**
   * Collection of separated parameters.
   *
   * Filled only when {@link IHttpLlmApplication.IOptions.separate} is configured.
   */
  separated?: IHttpLlmFunction.ISeparated<Model>;

  /**
   * Expected return type.
   *
   * If the target operation returns nothing (`void`), the `output`
   * would be `undefined`.
   */
  output?: ILlmSchema.ModelSchema[Model] | undefined;

  /**
   * Description of the function.
   *
   * `IHttpLlmFunction.description` is composed by below rule:
   *
   * 1. Starts from the {@link OpenApi.IOperation.summary} paragraph.
   * 2. The next paragraphs are filled with the
   *    {@link OpenApi.IOperation.description}. By the way, if the first
   *    paragraph of {@link OpenApi.IOperation.description} is same with the
   *    {@link OpenApi.IOperation.summary}, it would not be duplicated.
   * 3. Parameters' descriptions are added with `@param` tag.
   * 4. {@link OpenApi.IOperation.security Security requirements} are added
   *    with `@security` tag.
   * 5. Tag names are added with `@tag` tag.
   * 6. If {@link OpenApi.IOperation.deprecated}, `@deprecated` tag is added.
   *
   * For reference, the `description` is very important property to teach
   * the purpose of the function to the LLM (Language Large Model), and
   * LLM actually determines which function to call by the description.
   *
   * Also, when the LLM conversates with the user, the `description` is
   * used to explain the function to the user. Therefore, the `description`
   * property has the highest priority, and you have to consider it.
   */
  description?: string;

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
   * Same with {@link OpenApi.IOperation.tags} indicating the category of the function.
   */
  tags?: string[];

  /**
   * Get the Swagger operation metadata.
   *
   * Get the Swagger operation metadata, of the source.
   *
   * @returns Swagger operation metadata.
   */
  operation: () => OpenApi.IOperation;

  /**
   * Get the migration route metadata.
   *
   * Get the migration route metadata, of the source.
   *
   * @returns Migration route metadata.
   */
  route: () => IHttpMigrateRoute;
}
export namespace IHttpLlmFunction {
  /**
   * Collection of separated parameters.
   */
  export interface ISeparated<Model extends ILlmSchema.Model> {
    /**
     * Parameters that would be composed by the LLM.
     *
     * Even though no property exists in the LLM side, the `llm` property
     * would have at least empty object type.
     */
    llm: ILlmSchema.ModelParameters[Model];

    /**
     * Parameters that would be composed by the human.
     */
    human: ILlmSchema.ModelParameters[Model] | null;
  }
}
