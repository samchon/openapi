import { OpenApi } from "../OpenApi";

/**
 * Route information for migration.
 *
 * The `IHttpMigrateRoute` is a structure representing a route information for
 * OpenAPI generated RPC (Remote Procedure Call) function composed from the
 * {@link OpenApi.IOperation OpenAPI operation}.
 *
 * As the `IHttpMigrateRoute` has a lot of speical stories, when you're developing
 * OpenAPI generator library, please read its description carefully including
 * the description of its properties.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export interface IHttpMigrateRoute<
  Schema extends OpenApi.IJsonSchema = OpenApi.IJsonSchema,
  Operation extends OpenApi.IOperation<Schema> = OpenApi.IOperation<Schema>,
> {
  /**
   * Method of the route.
   *
   * If the {@link OpenApi.IOperation.method} is not one of below type
   * values, the operation would be ignored in the migration process for
   * the RPC (Remote Procedure Call) function.
   */
  method: "head" | "get" | "post" | "put" | "patch" | "delete";

  /**
   * Original path from the OpenAPI document.
   */
  path: string;

  /**
   * Emended path for OpenAPI generator libraries.
   *
   * The difference between {@link path} is:
   *
   * 1. Path parameters are replaced with `:param` format.
   * 2. Empty sub-paths are removed.
   * 3. Do not starts with `/`.
   */
  emendedPath: string;

  /**
   * Accessor for the route.
   *
   * The `accessor` is a list of string values that are representing how to
   * access to the OpenAPI generated RPC (Remote Procedure Call) function
   * through namespace(s).
   *
   * The `accessor` is composed with the following rules. At first, namespaces
   * are composed by static directory names in the {@link path}. Parametric
   * symbols represented by `:param` or `{param}` cannot be a part of the
   * namespace.
   *
   * Instead, they would be a part of the function name. The function
   * name is composed with the {@link method HTTP method} and parametric symbols
   * like `getByParam` or `postByParam`. If there are multiple path parameters,
   * they would be concatenated by `And` like `getByParam1AndParam2`.
   *
   * For refefence, if the {@link operation}'s {@link method} is `delete`, the
   * function name would be replaced to `erase` instead of `delete`. It is
   * the reason why the `delete` is a reserved keyword in many programming
   * languages.
   *
   * - Example 1
   *   - path: `POST /shopping/sellers/sales`
   *   - accessor: `shopping.sellers.sales.post`
   * - Example 2
   *   - endpoint: `GET /shoppings/sellers/sales/:saleId/reviews/:reviewId/comments/:id
   *   - accessor: `shoppings.sellers.sales.reviews.getBySaleIdAndReviewIdAndCommentId`
   */
  accessor: string[];

  /**
   * List of path parameters.
   *
   * Note that, not a list of every parameters, but only path parameters.
   */
  parameters: IHttpMigrateRoute.IParameter<Schema>[];

  /**
   * Metadata of headers.
   *
   * The `headers` property is a metadata of HTTP request headers for RPC function,
   * including the parameter variable name and schema.
   *
   * Also, its {@link IHttpMigrateRoute.IHeaders.schema} is always object or reference
   * to object. Even though the original {@link OpenApi.IOperation OpenAPI operation}'s
   * headers are separated to atomic typed properties, the `headers` property forcibly
   * combines them into a single object type.
   *
   * For reference, if the `headers` property has been converted to an object type
   * forcibly, its property {@link IHttpMigrateRoute.IHeaders.name name} and
   * {@link IHttpMigrateRoute.IHeaders.key key} are always "headers".
   */
  headers: IHttpMigrateRoute.IHeaders<Schema> | null;

  /**
   * Metadata of query values.
   *
   * The `query` property is a metadata of HTTP request query values for RPC function,
   * including the parameter variable name and schema.
   *
   * Also, its {@link IHttpMigrateRoute.IQuery.schema} is always object or reference
   * to object. Even though the original {@link OpenApi.IOperation OpenAPI operation}'s
   * query parameters are separated to atomic typed properties, the `query` property
   * forcibly combines them into a single object type.
   *
   * For reference, if the `query` property has been converted to an object type
   * forcibly, its property {@link IHttpMigrateRoute.IQuery.name name} and
   * {@link IHttpMigrateRoute.IQuery.key key} are always "headers".
   */
  query: IHttpMigrateRoute.IQuery<Schema> | null;

  /**
   * Metadata of request body.
   *
   * The `body` property is a metadata of HTTP request body for RPC function,
   * including the parameter variable name, content type, and schema.
   *
   * If the `body` property is `null`, it means the operation does not require
   * the request body data.
   */
  body: IHttpMigrateRoute.IBody<Schema> | null;

  /**
   * Metadata of response body for success case.
   *
   * The `success` property is a metadata of HTTP response body for RPC function,
   * including content type, and schema when status code is `200` or `201`.
   *
   * If the `success` property is `null`, it means the operation does not have
   * the response body data. In other words, the RPC function would return `void`.
   */
  success: IHttpMigrateRoute.IBody<Schema> | null;

  /**
   * Metadata of response body for exceptional status cases.
   *
   * The `exceptions` property is a metadata of HTTP response body for RPC
   * function, including content type, and schema when status code is not `200`
   * or `201`.
   *
   * The key of the `exceptions` property is the status code. It may be a
   * stringified number, but sometimes it could be a string like "default",
   * because the OpenAPI document allows the status code to be a string.
   */
  exceptions: Record<string, IHttpMigrateRoute.IException<Schema>>;

  /**
   * Description comment for the route function.
   *
   * The `comment` is a function returning description comment for the
   * RPC function of OpenAPI generated. The comment is composed with the
   * following rules:
   *
   * 1. Starts from the {@link OpenApi.IOperation.summary} paragraph.
   * 2. The next paragraphs are filled with {@link OpenApi.IOperation.description}.
   * 3. Parameter descriptions are added with `@param` tag.
   * 4. Security requirements are added with `@security` tag.
   * 5. Tag names are added with `@tag` tag.
   * 6. If {@link OpenApi.IOperation.deprecated}, `@deprecated` tag is added.
   */
  comment: () => string;

  /**
   * Original operation from the OpenAPI document.
   *
   * The `operation` is a function returning the original
   * {@link OpenApi.IOperation} from the {@link OpenAPI} document.
   */
  operation: () => Operation;
}
export namespace IHttpMigrateRoute {
  /**
   * Metadata of path parameter.
   */
  export interface IParameter<
    Schema extends OpenApi.IJsonSchema = OpenApi.IJsonSchema,
  > {
    /**
     * Name of the path parameter.
     */
    name: string;

    /**
     * Key of the path parameter.
     */
    key: string;

    /**
     * Metadata of path parameter data type.
     */
    schema: Schema;

    /**
     * Original parameter info from the OpenAPI document.
     *
     * The `parameter` is a function returning the original
     * {@link OpenApi.IOperation.IParameter} from the {@link OpenAPI} document.
     */
    parameter: () => OpenApi.IOperation.IParameter<Schema>;
  }

  /**
   * Metadata of headers.
   */
  export interface IHeaders<
    Schema extends OpenApi.IJsonSchema = OpenApi.IJsonSchema,
  > {
    /**
     * Name of the headers parameter.
     */
    name: string;

    /**
     * Key of the headers parameter.
     */
    key: string;

    /**
     * Metadata of headers data type.
     */
    schema: Schema;
    title: () => string | undefined;
    description: () => string | undefined;
    example: () => any | undefined;
    examples: () => Record<string, any> | undefined;
  }

  /**
   * Metadata of query values.
   */
  export interface IQuery<
    Schema extends OpenApi.IJsonSchema = OpenApi.IJsonSchema,
  > {
    name: string;
    key: string;
    schema: Schema;
    title: () => string | undefined;
    description: () => string | undefined;
    example: () => any | undefined;
    examples: () => Record<string, any> | undefined;
  }

  /**
   * Metadata of request/response body.
   */
  export interface IBody<
    Schema extends OpenApi.IJsonSchema = OpenApi.IJsonSchema,
  > {
    /**
     * Name of the body parameter.
     */
    name: string;

    /**
     * Key of the body parameter.
     */
    key: string;

    /**
     * Content type of the body.
     */
    type:
      | "text/plain"
      | "application/json"
      | "application/x-www-form-urlencoded"
      | "multipart/form-data";

    /**
     * Metadata of response body data type.
     */
    schema: Schema;

    /**
     * Description comment for the request/response body.
     */
    description: () => string | undefined;

    /**
     * Media type of the request/response body.
     */
    media: () => OpenApi.IOperation.IMediaType<Schema>;

    /**
     * Whether the body is encrypted or not.
     */
    "x-nestia-encrypted"?: boolean;
  }

  /**
   * Metadata of response body for exceptional status cases.
   */
  export interface IException<
    Schema extends OpenApi.IJsonSchema = OpenApi.IJsonSchema,
  > {
    /**
     * Metadata of response body data type.
     */
    schema: Schema;

    /**
     * Description comment for the exception.
     */
    response: () => OpenApi.IOperation.IResponse<Schema>;

    /**
     * Media type of the response body.
     */
    media: () => OpenApi.IOperation.IMediaType<Schema>;
  }
}
