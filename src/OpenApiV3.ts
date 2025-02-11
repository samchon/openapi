import { IJsonSchemaAttribute } from "./structures/IJsonSchemaAttribute";

/**
 * OpenAPI 3.0 definition.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace OpenApiV3 {
  export type Method =
    | "get"
    | "post"
    | "put"
    | "delete"
    | "options"
    | "head"
    | "patch"
    | "trace";

  /**
   * @internal
   */
  export const is = (input: any): input is IDocument =>
    typeof input === "object" &&
    input !== null &&
    typeof input.openapi === "string" &&
    input.openapi.startsWith("3.0");

  /* -----------------------------------------------------------
    DOCUMENTS
  ----------------------------------------------------------- */
  export interface IDocument {
    openapi: "3.0" | `3.0.${number}`;
    servers?: IServer[];
    info?: IDocument.IInfo;
    components?: IComponents;
    paths?: Record<string, IPath>;
    security?: Record<string, string[]>[];
    tags?: IDocument.ITag[];
  }
  export namespace IDocument {
    export interface IInfo {
      title: string;
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
      enum?: string[];
      description?: string;
    }
  }

  /* -----------------------------------------------------------
    PATH ITEMS
  ----------------------------------------------------------- */
  export interface IPath
    extends Partial<Record<Method, IOperation | undefined>> {
    parameters?: Array<
      | IOperation.IParameter
      | IJsonSchema.IReference<`#/components/headers/${string}`>
      | IJsonSchema.IReference<`#/components/parameters/${string}`>
    >;
    servers?: IServer[];
    summary?: string;
    description?: string;
  }

  export interface IOperation {
    operationId?: string;
    parameters?: Array<
      | IOperation.IParameter
      | IJsonSchema.IReference<`#/components/headers/${string}`>
      | IJsonSchema.IReference<`#/components/parameters/${string}`>
    >;
    requestBody?:
      | IOperation.IRequestBody
      | IJsonSchema.IReference<`#/components/requestBodies/${string}`>;
    responses?: Record<
      string,
      | IOperation.IResponse
      | IJsonSchema.IReference<`#/components/responses/${string}`>
    >;
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
      example?: any;
      examples?: Record<
        string,
        IExample | IJsonSchema.IReference<`#/components/examples/${string}`>
      >;
    }
    export interface IRequestBody {
      description?: string;
      required?: boolean;
      content?: Record<string, IMediaType>;
    }
    export interface IResponse {
      content?: Record<string, IMediaType>;
      headers?: Record<
        string,
        | Omit<IOperation.IParameter, "in">
        | IJsonSchema.IReference<`#/components/headers/${string}`>
      >;
      description?: string;
    }
    export interface IMediaType {
      schema?: IJsonSchema;
      example?: any;
      examples?: Record<
        string,
        IExample | IJsonSchema.IReference<`#/components/examples/${string}`>
      >;
    }
  }

  export interface IExample {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
  }

  /* -----------------------------------------------------------
    SCHEMA DEFINITIONS
  ----------------------------------------------------------- */
  export interface IComponents {
    schemas?: Record<string, IJsonSchema>;
    responses?: Record<string, IOperation.IResponse>;
    parameters?: Record<string, IOperation.IParameter>;
    requestBodies?: Record<string, IOperation.IRequestBody>;
    securitySchemes?: Record<string, ISecurityScheme>;
    headers?: Record<string, Omit<IOperation.IParameter, "in">>;
    examples?: Record<string, IExample>;
  }

  export type IJsonSchema =
    | IJsonSchema.IBoolean
    | IJsonSchema.IInteger
    | IJsonSchema.INumber
    | IJsonSchema.IString
    | IJsonSchema.IArray
    | IJsonSchema.IObject
    | IJsonSchema.IReference
    | IJsonSchema.IAllOf
    | IJsonSchema.IAnyOf
    | IJsonSchema.IOneOf
    | IJsonSchema.INullOnly
    | IJsonSchema.IUnknown;
  export namespace IJsonSchema {
    export interface IBoolean extends __ISignificant<"boolean"> {
      nullable?: boolean;
      default?: boolean | null;
      enum?: Array<boolean | null>;
    }
    export interface IInteger extends __ISignificant<"integer"> {
      nullable?: boolean;
      /** @type int64 */ default?: number | null;
      /** @type int64 */ enum?: Array<number | null>;
      /** @type int64 */ minimum?: number;
      /** @type int64 */ maximum?: number;
      exclusiveMinimum?: boolean;
      exclusiveMaximum?: boolean;
      /**
       * @type uint64
       * @exclusiveMinimum 0
       */
      multipleOf?: number;
    }
    export interface INumber extends __ISignificant<"number"> {
      nullable?: boolean;
      default?: number | null;
      enum?: Array<number | null>;
      minimum?: number;
      maximum?: number;
      exclusiveMinimum?: boolean;
      exclusiveMaximum?: boolean;
      /** @exclusiveMinimum 0 */ multipleOf?: number;
    }
    export interface IString extends __ISignificant<"string"> {
      nullable?: boolean;
      default?: string | null;
      enum?: Array<string | null>;
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
      /** @type uint64 */ minLength?: number;
      /** @type uint64 */ maxLength?: number;
    }

    export interface IArray extends IJsonSchemaAttribute.IArray {
      nullable?: boolean;
      items: IJsonSchema;
      uniqueItems?: boolean;
      /** @type uint64 */ minItems?: number;
      /** @type uint64 */ maxItems?: number;
    }
    export interface IObject extends IJsonSchemaAttribute.IObject {
      nullable?: boolean;
      properties?: Record<string, IJsonSchema>;
      required?: string[];
      additionalProperties?: boolean | IJsonSchema;
      maxProperties?: number;
      minProperties?: number;
    }
    export interface IReference<Key = string> extends IJsonSchemaAttribute {
      $ref: Key;
    }

    export interface IAllOf extends IJsonSchemaAttribute {
      allOf: IJsonSchema[];
    }
    export interface IAnyOf extends IJsonSchemaAttribute {
      anyOf: IJsonSchema[];
    }
    export interface IOneOf extends IJsonSchemaAttribute {
      oneOf: IJsonSchema[];
      discriminator?: IOneOf.IDiscriminator;
    }
    export namespace IOneOf {
      export interface IDiscriminator {
        propertyName: string;
        mapping?: Record<string, string>;
      }
    }

    export interface INullOnly extends IJsonSchemaAttribute.INull {
      default?: null;
    }
    export interface IUnknown extends IJsonSchemaAttribute.IUnknown {
      default?: any;
    }

    /**
     * @deprecated
     * @hidden
     */
    export interface __ISignificant<Type extends string>
      extends IJsonSchemaAttribute {
      type: Type;
      nullable?: boolean;
    }

    /**
     * @deprecated
     * @hidden
     */
    export type __IAttribute = IJsonSchemaAttribute;
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
