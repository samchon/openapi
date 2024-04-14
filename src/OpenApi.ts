import { OpenApiV3 } from "./OpenApiV3";
import { OpenApiV3_1 } from "./OpenApiV3_1";
import { SwaggerV2 } from "./SwaggerV2";
import { OpenApiV3Converter } from "./internal/OpenApiV3Converter";
import { OpenApiV3_1Converter } from "./internal/OpenApiV3_1Converter";
import { SwaggerV2Converter } from "./internal/SwaggerV2Converter";

/**
 * Emended OpenAPI v3.1 definition used by `typia` and `nestia`.
 *
 * `OpenApi` is a namespace containing functions and interfaces for emended
 * OpenAPI v3.1 specification. The keyword "emended" means that `OpenApi` is
 * not a direct OpenAPI v3.1 specification ({@link OpenApiV3_1}), but a little
 * bit shrinked to remove ambiguous and duplicated expressions of OpenAPI v3.1
 * for the convenience of `typia` and `nestia`.
 *
 * For example, when representing nullable type, OpenAPI v3.1 supports three ways.
 * In that case, `OpenApi` remains only the third way, so that makes `typia` and
 * `nestia` (especially `@nestia/editor`) to be simple and easy to implement.
 *
 * 1. `{ type: ["string", "null"] }`
 * 2. `{ type: "string", nullable: true }`
 * 3. `{ oneOf: [{ type: "string" }, { type: "null" }] }`
 *
 * Here is the entire list of differences between OpenAPI v3.1 and emended `OpenApi`.
 *
 * - Operation
 *   - Merged {@link OpenApiV3_1.IPathItem.parameters} to {@link OpenApi.IOperation.parameters}
 *   - Resolved {@link OpenApi.IJsonSchema.IReference references} of {@link OpenApiV3_1.IOperation} mebers
 * - JSON Schema
 *   - Decomposed mixed type: {@link OpenApiV3_1.IJsonSchema.IMixed}
 *   - Resolved nullable property: {@link OpenApiV3_1.IJsonSchema.__ISignificant.nullable}
 *   - Array type utilizes only single {@link OpenAPI.IJsonSchema.IArray.items}
 *   - Tuple type utilizes only {@link OpenApi.IJsonSchema.ITuple.prefixItems}
 *   - Merged {@link OpenApiV3_1.IJsonSchema.IAnyOf} to {@link OpenApi.IJsonSchema.IOneOf}
 *   - Merged {@link OpenApiV3_1.IJsonSchema.IRecursiveReference} to {@link OpenApi.IJsonSchema.IReference}
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace OpenApi {
  /**
   * Convert Swagger or OpenAPI document into emended OpenAPI v3.1 document.
   *
   * @param input Swagger or OpenAPI document to convert
   * @returns Emended OpenAPI v3.1 document
   */
  export const convert = (
    input:
      | SwaggerV2.IDocument
      | OpenApiV3.IDocument
      | OpenApiV3_1.IDocument
      | OpenApi.IDocument,
  ): IDocument => {
    if (OpenApiV3_1.is(input)) return OpenApiV3_1Converter.convert(input);
    else if (OpenApiV3.is(input)) return OpenApiV3Converter.convert(input);
    else if (SwaggerV2.is(input)) return SwaggerV2Converter.convert(input);
    throw new TypeError("Unrecognized Swagger/OpenAPI version.");
  };

  export type Method =
    | "get"
    | "post"
    | "put"
    | "delete"
    | "options"
    | "head"
    | "patch"
    | "trace";

  /* -----------------------------------------------------------
    PATH ITEMS
  ----------------------------------------------------------- */
  export interface IDocument {
    openapi: `3.1.${number}`;
    servers?: IServer[];
    info?: IDocument.IInfo;
    components: IComponents;
    paths?: Record<string, IPathItem>;
    webhooks?: Record<
      string,
      IJsonSchema.IReference<`#/components/pathItems/${string}`> | IPathItem
    >;
    security?: Record<string, string[]>[];
    tags?: IDocument.ITag[];
    "x-samchon-emended": true;
  }
  export namespace IDocument {
    export interface IInfo {
      title: string;
      summary?: string;
      description?: string;
      termsOfService?: string;
      contact?: IContact;
      license?: ILicense;
      version: string;
    }
    export interface ITag {
      name: string;
      description?: string;
    }
    export interface IContact {
      name?: string;
      url?: string;
      email?: string;
    }
    export interface ILicense {
      name: string;
      identifier?: string;
      url?: string;
    }
  }

  export interface IServer {
    url: string;
    description?: string;
    variables?: Record<string, IServer.IVariable>;
  }
  export namespace IServer {
    export interface IVariable {
      default: string;
      /** @minItems 1 */ enum?: string[];
      description?: string;
    }
  }

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  export type IPathItem = {
    servers?: IServer[];
    summary?: string;
    description?: string;
  } & Partial<Record<Method, IOperation>>;

  export interface IOperation {
    operationId?: string;
    parameters: Array<IOperation.IParameter>;
    requestBody?:
      | IOperation.IRequestBody
      | IJsonSchema.IReference<`#/components/requestBodies/${string}`>;
    responses?: Record<string, IOperation.IResponse>;
    servers?: IServer[];
    summary?: string;
    description?: string;
    security?: Record<string, string[]>[];
    tags?: string[];
    deprecated?: boolean;
  }
  export namespace IOperation {
    export interface IParameter {
      name?: string;
      in: "path" | "query" | "header" | "cookie";
      schema: IJsonSchema;
      required?: boolean;
      description?: string;
    }
    export interface IRequestBody {
      description?: string;
      required?: boolean;
      content?: Record<string, IMediaType>;
    }
    export interface IResponse {
      content?: Record<string, IMediaType>;
      headers?: Record<string, IOperation.IParameter>;
      description?: string;
    }
    export interface IMediaType {
      schema?: IJsonSchema;
    }
  }

  /* -----------------------------------------------------------
    SCHEMA DEFINITIONS
  ----------------------------------------------------------- */
  export interface IComponents {
    schemas: Record<string, IJsonSchema>;
    securitySchemes?: Record<string, ISecurityScheme>;
  }

  export type IJsonSchema =
    | IJsonSchema.IConstant
    | IJsonSchema.IBoolean
    | IJsonSchema.IInteger
    | IJsonSchema.INumber
    | IJsonSchema.IString
    | IJsonSchema.IArray
    | IJsonSchema.ITuple
    | IJsonSchema.IObject
    | IJsonSchema.IReference
    | IJsonSchema.IOneOf
    | IJsonSchema.INull
    | IJsonSchema.IUnknown;
  export namespace IJsonSchema {
    export interface IConstant extends __IAttribute {
      const: boolean | number | string;
    }
    export interface IBoolean extends __ISignificant<"boolean"> {
      default?: boolean;
    }
    export interface IInteger extends __ISignificant<"integer"> {
      /** @type int */ default?: number;
      /** @type int */ minimum?: number;
      /** @type int */ maximum?: number;
      /** @type int */ exclusiveMinimum?: boolean;
      /** @type int */ exclusiveMaximum?: boolean;
      /** @type uint */ multipleOf?: number;
    }
    export interface INumber extends __ISignificant<"number"> {
      default?: number;
      minimum?: number;
      maximum?: number;
      exclusiveMinimum?: boolean;
      exclusiveMaximum?: boolean;
      multipleOf?: number;
    }
    export interface IString extends __ISignificant<"string"> {
      contentMediaType?: string;
      default?: string;
      enum?: string[];
      format?:
        | "binary"
        | "byte"
        | "password"
        | "regex"
        | "uuid"
        | "email"
        | "hostname"
        | "idn-email"
        | "idn-hostname"
        | "iri"
        | "iri-reference"
        | "ipv4"
        | "ipv6"
        | "uri"
        | "uri-reference"
        | "uri-template"
        | "url"
        | "date-time"
        | "date"
        | "time"
        | "duration"
        | "json-pointer"
        | "relative-json-pointer"
        | (string & {});
      pattern?: string;
      /** @type uint */ minLength?: number;
      /** @type uint */ maxLength?: number;
    }

    export interface IArray extends __ISignificant<"array"> {
      items: IJsonSchema;
      /** @type uint */ minItems?: number;
      /** @type uint */ maxItems?: number;
    }
    export interface ITuple extends __ISignificant<"array"> {
      prefixItems: IJsonSchema[];
      additionalItems: boolean | IJsonSchema;
      /** @type uint */ minItems?: number;
      /** @type uint */ maxItems?: number;
    }
    export interface IObject extends __ISignificant<"object"> {
      properties?: Record<string, IJsonSchema>;
      additionalProperties?: boolean | IJsonSchema;
      required?: string[];
    }
    export interface IReference<Key = string> extends __IAttribute {
      $ref: Key;
    }

    export interface IOneOf extends __IAttribute {
      oneOf: Exclude<IJsonSchema, IJsonSchema.IOneOf>[];
    }
    export interface INull extends __ISignificant<"null"> {}
    export interface IUnknown extends __IAttribute {
      type?: undefined;
    }

    export interface __ISignificant<Type extends string> extends __IAttribute {
      type: Type;
    }
    export interface __IAttribute {
      title?: string;
      description?: string;
      deprecated?: boolean;
    }
  }

  export type ISecurityScheme =
    | ISecurityScheme.IApiKey
    | ISecurityScheme.IHttpBasic
    | ISecurityScheme.IHttpBearer
    | ISecurityScheme.IOAuth2
    | ISecurityScheme.IOpenId;
  export namespace ISecurityScheme {
    export interface IApiKey {
      type: "apiKey";
      in?: "header" | "query" | "cookie";
      name?: string;
      description?: string;
    }
    export interface IHttpBasic {
      type: "http";
      scheme: "basic";
      description?: string;
    }
    export interface IHttpBearer {
      type: "http";
      scheme: "bearer";
      bearerFormat?: string;
      description?: string;
    }
    export interface IOAuth2 {
      type: "oauth2";
      flows: IOAuth2.IFlowSet;
      description?: string;
    }
    export interface IOpenId {
      type: "openIdConnect";
      openIdConnectUrl: string;
      description?: string;
    }
    export namespace IOAuth2 {
      export interface IFlowSet {
        authorizationCode?: IFlow;
        implicit?: Omit<IFlow, "tokenUrl">;
        password?: Omit<IFlow, "authorizationUrl">;
        clientCredentials?: Omit<IFlow, "authorizationUrl">;
      }
      export interface IFlow {
        authorizationUrl?: string;
        tokenUrl?: string;
        refreshUrl?: string;
        scopes?: Record<string, string>;
      }
    }
  }
}
