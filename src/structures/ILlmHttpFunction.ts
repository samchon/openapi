import { OpenApi } from "../OpenApi";
import { ILlmSchema } from "./ILlmSchema";
import { IMigrateRoute } from "./IMigrateRoute";

/**
 * LLM function metadata from HTTP (OpenAPI) operation.
 *
 * `ILlmHttpFunction` is a data structure representing a procedure converted
 * from the OpenAPI operation, used for the LLM (Large Language Model)
 * function calling. It's a typical RPC (Remote Procedure Call) structure
 * containing the procedure {@link name}, {@link parameters}, and
 * {@link output return type}.
 *
 * If you provide this `ILlmHttpFunction` data to the LLM like "OpenAI",
 * the "OpenAI" will compose a function arguments by analyzing
 * conversations with the user. With the LLM composed arguments, you can
 * execute the procedure through {@link LlmFetcher.execute} and get the
 * result.
 *
 * For reference, different between `ILlmHttpFunction` and its origin source
 * {@link OpenApi.IOperation} is, `ILlmHttpFunction` has converted every type
 * schema informations from {@link OpenApi.IJsonSchema} to {@link ILlmSchema}
 * to escape {@link OpenApi.IJsonSchema.IReference reference types}, and
 * downgrade the version of the JSON schema to OpenAPI 3.0. It's because
 * LLM function call feature cannot understand both reference types and
 * OpenAPI 3.1 specification.
 *
 * Additionally, if you've composed `ILlmHttpFunction` with
 * {@link ILlmHttpApplication.IOptions.keyword} configuration as `true`, number of
 * {@link ILlmHttpFunction.parameters} are always 1 and the first parameter's
 * type is always {@link ILlmSchema.IObject}. The properties' rule is:
 *
 * - `pathParameters`: Path parameters of {@link OpenApi.IOperation.parameters}
 * - `query`: Query parameter of {@link IMigrateRoute.query}
 * - `body`: Body parameter of {@link IMigrateRoute.body}
 *
 * ```typescript
 * {
 *   ...pathParameters,
 *   query,
 *   body,
 * }
 * ```
 *
 * Otherwise, the parameters would be multiple, and the sequence of the parameters
 * are following below rules:
 *
 * ```typescript
 * [
 *   ...pathParameters,
 *   ...(query ? [query] : []),
 *   ...(body ? [body] : []),
 * ]
 * ```
 *
 * @reference https://platform.openai.com/docs/guides/function-calling
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface ILlmHttpFunction<
  Schema extends ILlmSchema = ILlmSchema,
  Operation extends OpenApi.IOperation = OpenApi.IOperation,
  Route extends IMigrateRoute = IMigrateRoute,
> {
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
   * {@link ILlmHttpApplication}. The `name` value is just composed by joining the
   * {@link IMigrateRoute.accessor} by underscore `_` character.
   *
   * Here is the composition rule of the  {@link IMigrateRoute.accessor}:
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
   */
  name: string;

  /**
   * Whether the function schema types are strict or not.
   *
   * Newly added specification to "OpenAI" at 2024-08-07.
   *
   * @reference https://openai.com/index/introducing-structured-outputs-in-the-api/
   */
  strict: true;

  /**
   * List of parameter types.
   *
   * If you've configured {@link ILlmHttpApplication.IOptions.keyword} as `true`,
   * number of {@link ILlmHttpFunction.parameters} are always 1 and the first
   * parameter's type is always {@link ILlmSchema.IObject}. The
   * properties' rule is:
   *
   * - `pathParameters`: Path parameters of {@link IMigrateRoute.parameters}
   * - `query`: Query parameter of {@link IMigrateRoute.query}
   * - `body`: Body parameter of {@link IMigrateRoute.body}
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
  parameters: Schema[];

  /**
   * Collection of separated parameters.
   *
   * Filled only when {@link ILlmHttpApplication.IOptions.separate} is configured.
   */
  separated?: ILlmHttpFunction.ISeparated<Schema>;

  /**
   * Expected return type.
   *
   * If the target operation returns nothing (`void`), the `output`
   * would be `undefined`.
   */
  output?: Schema | undefined;

  /**
   * Description of the procedure.
   *
   * `ILlmHttpFunction.description` is composed by below rule:
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
   * property has the highest priroity, and you have to consider it.
   */
  description?: string;

  /**
   * Get the Swagger operation metadata.
   *
   * Get the Swagger operation metadata, of the source.
   *
   * @returns Swagger operation metadata.
   */
  operation: () => Operation;

  /**
   * Get the migration route metadata.
   *
   * Get the migration route metadata, of the source.
   *
   * @returns Migration route metadata.
   */
  route: () => Route;
}
export namespace ILlmHttpFunction {
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
     */
    index: number;

    /**
     * Type schema info of the parameter.
     */
    schema: Schema;
  }
}
