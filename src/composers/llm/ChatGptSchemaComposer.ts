import { OpenApi } from "../../OpenApi";
import { IChatGptSchema } from "../../structures/IChatGptSchema";
import { IGeminiSchema } from "../../structures/IGeminiSchema";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { ILlmSchemaV3_1 } from "../../structures/ILlmSchemaV3_1";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../structures/IResult";
import { GeminiTypeChecker } from "../../utils/GeminiTypeChecker";
import { OpenApiTypeChecker } from "../../utils/OpenApiTypeChecker";
import { GeminiSchemaComposer } from "./GeminiSchemaComposer";
import { LlmDescriptionInverter } from "./LlmDescriptionInverter";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace ChatGptSchemaComposer {
  /** @internal */
  export const IS_DEFS = true;

  export const DEFAULT_CONFIG: IChatGptSchema.IConfig = {
    reference: true,
    strict: false,
  };

  export const parameters = (props: {
    config: IChatGptSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IChatGptSchema.IParameters, IOpenApiSchemaError> => {
    // polyfill
    props.config.strict ??= false;

    // validate
    const result: IResult<ILlmSchemaV3_1.IParameters, IOpenApiSchemaError> =
      LlmSchemaV3_1Composer.parameters({
        ...props,
        config: {
          reference: props.config.reference,
          constraint: false,
        },
        validate: props.config.strict === true ? validateStrict : undefined,
      });
    if (result.success === false) return result;

    // returns with transformation
    for (const key of Object.keys(result.value.$defs))
      result.value.$defs[key] = transform({
        config: props.config,
        schema: result.value.$defs[key],
      });
    return {
      success: true,
      value: transform({
        config: props.config,
        schema: result.value,
      }) as IChatGptSchema.IParameters,
    };
  };

  export const schema = (props: {
    config: IChatGptSchema.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, IChatGptSchema>;
    schema: OpenApi.IJsonSchema;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IChatGptSchema, IOpenApiSchemaError> => {
    // polyfill
    props.config.strict ??= false;

    // validate
    const oldbie: Set<string> = new Set(Object.keys(props.$defs));
    const result: IResult<ILlmSchemaV3_1, IOpenApiSchemaError> =
      LlmSchemaV3_1Composer.schema({
        ...props,
        config: {
          reference: props.config.reference,
          constraint: false,
        },
        validate: props.config.strict === true ? validateStrict : undefined,
      });
    if (result.success === false) return result;

    // returns with transformation
    for (const key of Object.keys(props.$defs))
      if (oldbie.has(key) === false)
        props.$defs[key] = transform({
          config: props.config,
          schema: props.$defs[key],
        });
    return {
      success: true,
      value: transform({
        config: props.config,
        schema: result.value,
      }),
    };
  };

  const validateStrict = (
    schema: OpenApi.IJsonSchema,
    accessor: string,
  ): IOpenApiSchemaError.IReason[] => {
    const reasons: IOpenApiSchemaError.IReason[] = [];
    if (OpenApiTypeChecker.isObject(schema)) {
      if (!!schema.additionalProperties)
        reasons.push({
          schema: schema,
          accessor: `${accessor}.additionalProperties`,
          message:
            "ChatGPT does not allow additionalProperties in strict mode, the dynamic key typed object.",
        });
      for (const key of Object.keys(schema.properties ?? {}))
        if (schema.required?.includes(key) === false)
          reasons.push({
            schema: schema,
            accessor: `${accessor}.properties.${key}`,
            message:
              "ChatGPT does not allow optional properties in strict mode.",
          });
    }
    return reasons;
  };

  const transform = (props: {
    config: IChatGptSchema.IConfig;
    schema: ILlmSchemaV3_1;
  }): IChatGptSchema => {
    const schema: IGeminiSchema = GeminiSchemaComposer.transform(props);
    GeminiTypeChecker.visit({
      closure: (next) => {
        if (GeminiTypeChecker.isString(next))
          Object.assign(next, LlmDescriptionInverter.string(next.description));
        else if (
          GeminiTypeChecker.isInteger(next) ||
          GeminiTypeChecker.isNumber(next)
        )
          Object.assign(next, LlmDescriptionInverter.numeric(next.description));
        else if (GeminiTypeChecker.isArray(next))
          Object.assign(next, LlmDescriptionInverter.array(next.description));
        else if (
          GeminiTypeChecker.isObject(next) &&
          props.config.strict === true
        )
          next.additionalProperties = false;
      },
      schema,
    });
    return schema satisfies IChatGptSchema;
  };

  export const separateParameters = (props: {
    parameters: IChatGptSchema.IParameters;
    predicate: (schema: IChatGptSchema) => boolean;
    convention?: (key: string, type: "llm" | "human") => string;
    equals?: boolean;
  }): ILlmFunction.ISeparated<"chatgpt"> =>
    GeminiSchemaComposer.separateParameters(
      props,
    ) satisfies ILlmFunction.ISeparated<"chatgpt">;

  export const invert = (props: {
    components: OpenApi.IComponents;
    schema: IChatGptSchema;
    $defs: Record<string, IChatGptSchema>;
  }): OpenApi.IJsonSchema => {
    const result: OpenApi.IJsonSchema = GeminiSchemaComposer.invert(props);
    OpenApiTypeChecker.visit({
      components: props.components,
      schema: result,
      closure: (next) => {
        if (OpenApiTypeChecker.isString(next))
          Object.assign(next, LlmDescriptionInverter.string(next.description));
        else if (
          OpenApiTypeChecker.isInteger(next) ||
          OpenApiTypeChecker.isNumber(next)
        )
          Object.assign(next, LlmDescriptionInverter.numeric(next.description));
        else if (OpenApiTypeChecker.isArray(next))
          Object.assign(next, LlmDescriptionInverter.array(next.description));
      },
    });
    return result;
  };
}
