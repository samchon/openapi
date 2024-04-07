export namespace OpenApiV3 {
  export interface IDocument {
    openapi: `3.0.${number}`;
    servers?: IDocument.IServer[];
    info: IDocument.IInfo;
    components?: IComponents;
    paths: Record<string, Record<string, IRoute>>;
    security?: Record<string, string[]>[];
    tags?: IDocument.ITag[];
  }
  export namespace IDocument {
    export interface IServer {
      /** @format uri */ url: string;
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
      /** @format uri */ url?: string;
      /** @format email */ email?: string;
    }
    export interface ILicense {
      name: string;
      /** @format email */ url?: string;
    }
  }

  export interface IRoute {
    parameters?: Array<
      | IRoute.IParameter
      | IJsonSchema.IReference<`#/components/headers/${string}`>
      | IJsonSchema.IReference<`#/components/parameters/${string}`>
    >;
    requestBody?:
      | IRoute.IRequestBody
      | IJsonSchema.IReference<`#/components/requestBodies/${string}`>;
    responses?: Record<
      string,
      | IRoute.IResponse
      | IJsonSchema.IReference<`#/components/responses/${string}`>
    >;
    summary?: string;
    description?: string;
    security?: Record<string, string[]>;
    tags?: string[];
  }
  export namespace IRoute {
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
      description?: string;
    }
    export interface IMediaType {
      schema: IJsonSchema;
    }
  }

  export interface IComponents {
    schemas?: Record<string, IJsonSchema>;
    responses?: Record<string, IRoute.IResponse>;
    parameters?: Record<string, IRoute.IParameter>;
    requestBodies?: Record<string, IRoute.IRequestBody>;
    securitySchemes?: Record<string, ISecurityScheme>;
    headers?: Record<string, IRoute.IParameter>;
  }
  export type IJsonSchema =
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
    export interface IBoolean extends __ISignificant<"boolean"> {
      default?: boolean;
      enum?: boolean[];
    }
    export interface IInteger extends __ISignificant<"integer"> {
      /** @type int */ default?: number;
      /** @type int */ enum?: number[];
      /** @type int */ minimum?: number;
      /** @type int */ maximum?: number;
      /** @type int */ exclusiveMinimum?: boolean;
      /** @type int */ exclusiveMaximum?: boolean;
      /** @type uint */ multipleOf?: number;
    }
    export interface INumber extends __ISignificant<"number"> {
      default?: number;
      enum?: number[];
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
      item: IJsonSchema;
      uniqueItems?: boolean;
      /** @type uint */ minItems?: number;
      /** @type uint */ maxItems?: number;
    }
    export interface IObject extends __ISignificant<"object"> {
      properties: Record<string, IJsonSchema>;
      required?: string[];
      additionalProperties?: boolean | IJsonSchema;
    }
    export interface IReference<Key = string> extends __IAttribute {
      $ref: Key;
    }

    export interface IUnknown extends __IAttribute {
      type?: undefined;
    }
    export interface INullOnly extends __IAttribute {
      type: "null";
    }
    export interface IAllOf extends __IAttribute {
      allOf: IJsonSchema[];
    }
    export interface IAnyOf extends __IAttribute {
      anyOf: IJsonSchema[];
    }
    export interface IOneOf extends __IAttribute {
      oneOf: IJsonSchema[];
    }

    export interface __ISignificant<Type extends string> extends __IAttribute {
      type: Type;
      nullable?: boolean;
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
