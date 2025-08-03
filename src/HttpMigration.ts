import { OpenApi } from "./OpenApi";
import { OpenApiV3 } from "./OpenApiV3";
import { OpenApiV3_1 } from "./OpenApiV3_1";
import { SwaggerV2 } from "./SwaggerV2";
import { HttpMigrateApplicationComposer } from "./composers/migrate/HttpMigrateApplicationComposer";
import { HttpMigrateRouteFetcher } from "./http/HttpMigrateRouteFetcher";
import { IHttpConnection } from "./structures/IHttpConnection";
import { IHttpMigrateApplication } from "./structures/IHttpMigrateApplication";
import { IHttpMigrateRoute } from "./structures/IHttpMigrateRoute";
import { IHttpResponse } from "./structures/IHttpResponse";

/**
 * HTTP migration application composer from OpenAPI documents.
 *
 * `HttpMigration` is a module for converting OpenAPI documents into HTTP migration
 * applications. It is designed to help OpenAPI generator libraries convert
 * {@link OpenApi.IOperation OpenAPI operations} to RPC (Remote Procedure
 * Call) functions.
 *
 * **Key features:**
 * - **Application conversion**: {@link HttpMigration.application} converts
 *   {@link OpenApi.IOperation OpenAPI operations} to
 *   {@link IHttpMigrateRoute HTTP migration routes}, normalizing OpenAPI
 *   operations into RPC function calling suitable route structures.
 * - **HTTP execution**: {@link HttpMigration.execute} and
 *   {@link HttpMigration.propagate} execute HTTP requests to the HTTP server.
 *   - `execute`: Returns response body for 200/201 status codes, throws {@link HttpError} otherwise
 *   - `propagate`: Returns complete response information including status code, headers, and body
 *
 * **Usage example**: The {@link HttpLlm} module utilizes this `HttpMigration`
 * module for composing RPC function calling applications. It composes LLM
 * (Large Language Model) function calling applications from OpenAPI documents
 * by passing through the {@link IHttpLlmApplication} type.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace HttpMigration {
  /* -----------------------------------------------------------
    COMPOSER
  ----------------------------------------------------------- */
  /**
   * Convert HTTP migration application from OpenAPI document.
   *
   * `HttpMigration.application()` is a function converting the
   * {@link OpenApi.IDocument OpenAPI document} and its
   * {@link OpenApi.IOperation operations} to the
   * {@link IHttpMigrateApplication HTTP migration application}.
   *
   * The HTTP migration application is designed for helping the OpenAPI
   * generator libraries, which converts OpenAPI operations to an RPC (Remote
   * Procedure Call) function. To support the OpenAPI generator libraries,
   * {@link IHttpMigrateRoute} takes below normalization rules:
   *
   * - Path parameters are separated to atomic level.
   * - Query parameters are binded into one object.
   * - Header parameters are binded into one object.
   * - Allow only below HTTP methods
   *
   *   - `head`
   *   - `get`
   *   - `post`
   *   - `put`
   *   - `patch`
   *   - `delete`
   * - Allow only below content media types
   *
   *   - `application/json`
   *   - `application/x-www-form-urlencoded`
   *   - `multipart/form-data`
   *   - `text/plain`
   *
   * If there're some {@link OpenApi.IOperation API operations} which canont
   * adjust the above rules or there're some logically insensible, these
   * operation would be failed to migrate and registered into the
   * {@link IHttpMigrateApplication.errors}.
   *
   * @param document OpenAPI document to migrate.
   * @returns Migrated application.
   */
  export const application = (
    document:
      | OpenApi.IDocument
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument,
  ): IHttpMigrateApplication =>
    HttpMigrateApplicationComposer.compose(OpenApi.convert(document));

  /** Properties for the request to the HTTP server. */
  export interface IFetchProps {
    /** Connection info to the HTTP server. */
    connection: IHttpConnection;

    /** Route information for the migration. */
    route: IHttpMigrateRoute;

    /**
     * Path parameters.
     *
     * Path parameters with sequenced array or key-value paired object.
     */
    parameters:
      | Array<string | number | boolean | bigint | null>
      | Record<string, string | number | boolean | bigint | null>;

    /** Query parameters as a key-value paired object. */
    query?: object | undefined;

    /** Request body data. */
    body?: object | undefined;
  }

  /* -----------------------------------------------------------
    FETCHERS
  ----------------------------------------------------------- */
  /**
   * Execute the HTTP request.
   *
   * `HttpMigration.execute()` is a function executing the HTTP request to the
   * HTTP server.
   *
   * It returns the response body from the API endpoint when the status code is
   * `200` or `201`. Otherwise, it throws an {@link HttpError} when the status
   * code is not `200` or `201`.
   *
   * If you want to get more information than the response body, or get the
   * detailed response information even when the status code is `200` or `201`,
   * use the {@link HttpMigration.propagate} function instead.
   *
   * @param props Properties for the request.
   * @returns Return value (response body) from the API endpoint.
   * @throws HttpError when the API endpoint responds none 200/201 status.
   */
  export const execute = (props: IFetchProps): Promise<unknown> =>
    HttpMigrateRouteFetcher.execute(props);

  /**
   * Propagate the HTTP request.
   *
   * `HttpMigration.propagate()` is a function propagating the request to the
   * HTTP server.
   *
   * It returns the response information from the API endpoint, including the
   * status code, headers, and response body.
   *
   * Even if the status code is not `200` or `201`, this function would return
   * the response information. By the way, if the connection to the HTTP server
   * is failed, this function would throw an {@link Error}.
   *
   * @param props Properties for the request.
   * @returns Response from the API endpoint.
   * @throws Error when the connection is failed.
   */
  export const propagate = (props: IFetchProps): Promise<IHttpResponse> =>
    HttpMigrateRouteFetcher.propagate(props);
}
