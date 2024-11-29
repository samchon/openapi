import { OpenApi } from "../OpenApi";
import { IGeminiSchema } from "../structures/IGeminiSchema";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { LlmTypeCheckerV3 } from "../utils/LlmTypeCheckerV3";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";
import { LlmConverterV3 } from "./LlmConverterV3";
import { LlmParametersFinder } from "./LlmParametersFinder";

export namespace GeminiConverter {
  export const parameters = (props: {
    config: IGeminiSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    errors?: string[];
    accessor?: string;
  }): IGeminiSchema.IParameters | null => {
    const entity: OpenApi.IJsonSchema.IObject | null =
      LlmParametersFinder.find(props);
    if (entity === null) return null;
    return schema({
      ...props,
      schema: entity,
    }) as IGeminiSchema.IParameters | null;
  };

  export const schema = (props: {
    config: IGeminiSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    errors?: string[];
    accessor?: string;
  }): IGeminiSchema | null => {
    // TRANSFORM TO LLM SCHEMA OF V3.0
    const schema: ILlmSchemaV3 | null = LlmConverterV3.schema({
      ...props,
      config: {
        recursive: props.config.recursive,
        constraint: false,
      },
      validate: (next, accessor): boolean => {
        if (OpenApiTypeChecker.isObject(next)) {
          if (!!next.additionalProperties) {
            if (props.errors)
              props.errors.push(
                `${accessor}.additionalProperties: Gemini does not allow additionalProperties, the dynamic key typed object.`,
              );
            return false;
          }
        } else if (OpenApiTypeChecker.isOneOf(next)) {
          if (props.errors)
            props.errors.push(`${accessor}: Gemini does not allow union type.`);
          return false;
        }
        return true;
      },
    });
    if (schema === null) return null;

    // SPECIALIZATIONS
    LlmTypeCheckerV3.visit({
      schema,
      closure: (v) => {
        if (v.title !== undefined) {
          if (v.description === undefined) v.description = v.title;
          else {
            const title: string = v.title.endsWith(".")
              ? v.title.substring(0, v.title.length - 1)
              : v.title;
            v.description = v.description.startsWith(title)
              ? v.description
              : `${title}.\n\n${v.description}`;
          }
          delete v.title;
        }
        if (
          LlmTypeCheckerV3.isObject(v) &&
          v.additionalProperties !== undefined
        ) {
          delete (v as Partial<ILlmSchemaV3.IObject>).additionalProperties;
        }
      },
      accessor: props.accessor,
    });

    // DO NOT ALLOW UNION TYPE
    return schema as IGeminiSchema;
  };

  export const separate = (props: {
    predicate: (schema: IGeminiSchema) => boolean;
    schema: IGeminiSchema;
  }): [IGeminiSchema | null, IGeminiSchema | null] =>
    LlmConverterV3.separate(
      props as {
        predicate: (schema: ILlmSchemaV3) => boolean;
        schema: ILlmSchemaV3;
      },
    );
}
