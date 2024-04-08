export namespace OpenApiV3_1 {
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
    DOCUMENTS
  ----------------------------------------------------------- */
  export interface IDocument {
    openapi: `3.1.${number}`;
    servers?: IServer[];
    info?: IDocument.IInfo;
    components?: IComponents;
    paths?: Record<string, IPathItem>;
    webhooks?: Record<
      string,
      IJsonSchema.IReference<`#/components/pathItems/${string}`> | IPathItem
    >;
    security?: Record<string, string[]>[];
    tags?: IDocument.ITag[];
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
      /** @format uri */ url?: string;
      /** @format email */ email?: string;
    }
    export interface ILicense {
      name: string;
      identifier?: string;
      /** @format email */ url?: string;
    }
  }

  export interface IServer {
    /** @format uri */ url: string;
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
    PATH ITEMS
  ----------------------------------------------------------- */
  export type IPathItem = {
    parameters?: Array<
      | IOperation.IParameter
      | IJsonSchema.IReference<`#/components/headers/${string}`>
      | IJsonSchema.IReference<`#/components/parameters/${string}`>
    >;
    servers?: IServer[];
    summary?: string;
    description?: string;
  } & Partial<Record<Method, IOperation>>;

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
    security?: Record<string, string[]>;
    tags?: string[];
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
      headers?: Record<
        string,
        | IOperation.IParameter
        | IJsonSchema.IReference<`#/components/headers/${string}`>
      >;
      description?: string;
    }
    export interface IMediaType {
      schema: IJsonSchema;
    }
  }

  /* -----------------------------------------------------------
    SCHEMA DEFINITIONS
  ----------------------------------------------------------- */
  export interface IComponents {
    schemas?: Record<string, IJsonSchema>;
    pathItems?: Record<string, IPathItem>;
    responses?: Record<string, IOperation.IResponse>;
    parameters?: Record<string, IOperation.IParameter>;
    requestBodies?: Record<string, IOperation.IRequestBody>;
    securitySchemes?: Record<string, ISecurityScheme>;
    headers?: Record<string, IOperation.IParameter>;
  }

  export type IJsonSchema =
    | IJsonSchema.IMixed
    | IJsonSchema.IConstant
    | IJsonSchema.IBoolean
    | IJsonSchema.IInteger
    | IJsonSchema.INumber
    | IJsonSchema.IString
    | IJsonSchema.IArray
    | IJsonSchema.IObject
    | IJsonSchema.IReference
    | IJsonSchema.IUnknown
    | IJsonSchema.INullOnly
    | IJsonSchema.IAllOf
    | IJsonSchema.IAnyOf
    | IJsonSchema.IOneOf;
  export namespace IJsonSchema {
    export interface IMixed
      extends IConstant,
        Omit<IBoolean, "type" | "default" | "enum">,
        Omit<INumber, "type" | "default" | "enum">,
        Omit<IString, "type" | "default" | "enum">,
        Omit<IArray, "type">,
        Omit<IObject, "type">,
        IOneOf,
        IAnyOf,
        IAllOf {
      type: Array<
        "boolean" | "integer" | "number" | "string" | "array" | "object"
      >;
      default?: any[];
      enum?: any[];
    }

    export interface IConstant extends __IAttribute {
      constant: boolean | number | string;
    }
    export interface IBoolean extends __ISignificant<"boolean"> {
      default?: boolean;
      enum?: boolean[];
    }
    export interface IInteger extends __ISignificant<"integer"> {
      /** @type int */ default?: number;
      /** @type int */ enum?: number[];
      /** @type int */ minimum?: number;
      /** @type int */ maximum?: number;
      /** @type int */ exclusiveMinimum?: number | boolean;
      /** @type int */ exclusiveMaximum?: number | boolean;
      /** @type uint */ multipleOf?: number;
    }
    export interface INumber extends __ISignificant<"number"> {
      default?: number;
      enum?: number[];
      minimum?: number;
      maximum?: number;
      exclusiveMinimum?: number | boolean;
      exclusiveMaximum?: number | boolean;
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

    export interface IUnknown extends __IAttribute {
      type?: undefined;
    }
    export interface INullOnly extends __ISignificant<"null"> {}
    export interface IAllOf extends __IAttribute {
      allOf: IJsonSchema[];
    }
    export interface IAnyOf extends __IAttribute {
      anyOf: IJsonSchema[];
    }
    export interface IOneOf extends __IAttribute {
      oneOf: IJsonSchema[];
    }

    export interface IArray extends __ISignificant<"array"> {
      item: IJsonSchema;
      prefixItems?: IJsonSchema[];
      /** @type uint */ minItems?: number;
      /** @type uint */ maxItems?: number;
      unevaluatedItems?: boolean | IJsonSchema;
      uniqueItems?: boolean;
    }
    export interface IObject extends __ISignificant<"object"> {
      properties: Record<string, IJsonSchema>;
      required?: string[];
      additionalProperties?: boolean | IJsonSchema;
      maxProperties?: number;
      minProperties?: number;
    }
    export interface IReference<Key = string> extends __IAttribute {
      $ref: Key;
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
      schema: "basic";
      description?: string;
    }
    export interface IHttpBearer {
      type: "http";
      schema: "bearer";
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
      /** @format uri */ openIdConnectUrl: string;
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
        authorizationUrl: string;
        /** @format uri */ tokenUrl?: string;
        /** @format uri */ refreshUrl?: string;
        scopes?: Record<string, string>;
      }
    }
  }
}
