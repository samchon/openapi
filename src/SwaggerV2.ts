/**
 * Swagger v2.0 definition.
 *
 * @author Jeongho Nam - https://github.com/samchon
 */
export namespace SwaggerV2 {
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
    typeof input.swagger === "string" &&
    input.swagger.startsWith("2.0");

  /* -----------------------------------------------------------
    DOCUMENTS
  ----------------------------------------------------------- */
  export interface IDocument {
    swagger: "2.0" | `2.0.${number}`;
    host?: string;
    basePath?: string;
    consumes?: string[];
    produces?: string[];
    definitions?: Record<string, IJsonSchema>;
    parameters?: Record<string, IOperation.IParameter>;
    responses?: Record<string, IOperation.IResponse>;
    securityDefinitions?: Record<string, ISecurityDefinition>;
    security?: Record<string, string[]>[];
    paths?: Record<string, IPathItem>;
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
    export interface IContact {
      name?: string;
      url?: string;
      email?: string;
    }
    export interface ILicense {
      name: string;
      url?: string;
    }
    export interface ITag {
      name: string;
      description?: string;
    }
  }

  /* -----------------------------------------------------------
    OPERATORS
  ----------------------------------------------------------- */
  export type IPathItem = {
    parameters?: Array<
      IOperation.IParameter | IJsonSchema.IReference<`#/parameters/${string}`>
    >;
  } & Partial<Record<Method, IOperation | undefined>>;

  export interface IOperation {
    operationId?: string;
    parameters?: Array<
      | IOperation.IParameter
      | IJsonSchema.IReference<`#/definitions/parameters/${string}`>
    >;
    responses?: Record<
      string,
      | IOperation.IResponse
      | IJsonSchema.IReference<`#/definitions/responses/${string}`>
    >;
    summary?: string;
    description?: string;
    security?: Record<string, string[]>[];
    tags?: string[];
    deprecated?: boolean;
  }
  export namespace IOperation {
    export type IParameter = IGeneralParameter | IBodyParameter;
    export type IGeneralParameter = IJsonSchema & {
      name: string;
      in: string;
      description?: string;
    };
    export interface IBodyParameter {
      schema: IJsonSchema;
      name: string;
      in: string;
      description?: string;
      required?: boolean;
    }
    export interface IResponse {
      description?: string;
      headers?: Record<string, IJsonSchema>;
      schema?: IJsonSchema;
    }
  }

  /* -----------------------------------------------------------
    DEFINITIONS
  ----------------------------------------------------------- */
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
      uniqueItems?: boolean;
      /** @type uint */ minItems?: number;
      /** @type uint */ maxItems?: number;
    }
    export interface IObject extends __ISignificant<"object"> {
      properties?: Record<string, IJsonSchema>;
      required?: string[];
      additionalProperties?: boolean | IJsonSchema;
      maxProperties?: number;
      minProperties?: number;
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
      "x-anyOf": IJsonSchema[];
    }
    export interface IOneOf extends __IAttribute {
      "x-oneOf": IJsonSchema[];
    }

    export interface __ISignificant<Type extends string> extends __IAttribute {
      type: Type;
      "x-nullable"?: boolean;
    }
    export interface __IAttribute {
      title?: string;
      description?: string;
      deprecated?: boolean;
    }
  }

  export type ISecurityDefinition =
    | ISecurityDefinition.IApiKey
    | ISecurityDefinition.IBasic
    | ISecurityDefinition.IOauth2Implicit
    | ISecurityDefinition.IOauth2AccessCode
    | ISecurityDefinition.IOauth2Password
    | ISecurityDefinition.IOauth2Application;
  export namespace ISecurityDefinition {
    export interface IApiKey {
      type: "apiKey";
      in?: "header" | "query" | "cookie";
      name?: string;
      description?: string;
    }
    export interface IBasic {
      type: "basic";
      name?: string;
      description?: string;
    }

    export interface IOauth2Implicit {
      type: "oauth2";
      flow: "implicit";
      authorizationUrl?: string;
      scopes?: Record<string, string>;
      description?: string;
    }
    export interface IOauth2AccessCode {
      type: "oauth2";
      flow: "accessCode";
      authorizationUrl?: string;
      tokenUrl?: string;
      scopes?: Record<string, string>;
      description?: string;
    }
    export interface IOauth2Password {
      type: "oauth2";
      flow: "password";
      tokenUrl?: string;
      scopes?: Record<string, string>;
      description?: string;
    }
    export interface IOauth2Application {
      type: "oauth2";
      flow: "application";
      tokenUrl?: string;
      scopes?: Record<string, string>;
      description?: string;
    }
  }
}
