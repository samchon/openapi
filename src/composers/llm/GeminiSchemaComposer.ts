import { OpenApi } from "../../OpenApi";
import { OpenApiV3 } from "../../OpenApiV3";
import { OpenApiV3_1 } from "../../OpenApiV3_1";
import { IGeminiSchema } from "../../structures/IGeminiSchema";
import { ILlmSchemaV3 } from "../../structures/ILlmSchemaV3";
import { LlmTypeCheckerV3 } from "../../utils/LlmTypeCheckerV3";
import { OpenApiTypeChecker } from "../../utils/OpenApiTypeChecker";
import { LlmParametersFinder } from "../llm/LlmParametersFinder";
import { LlmSchemaV3Composer } from "./LlmSchemaV3Composer";

export namespace GeminiSchemaComposer {
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
    const schema: ILlmSchemaV3 | null = LlmSchemaV3Composer.schema({
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
        } else if (
          OpenApiTypeChecker.isOneOf(next) &&
          isOneOf(props.components)(next)
        ) {
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
    schema: IGeminiSchema.IParameters;
  }): [IGeminiSchema.IParameters | null, IGeminiSchema.IParameters | null] =>
    LlmSchemaV3Composer.separate(
      props as {
        predicate: (schema: ILlmSchemaV3) => boolean;
        schema: ILlmSchemaV3.IParameters;
      },
    );
}

const isOneOf =
  (components: OpenApi.IComponents) =>
  (schema: OpenApi.IJsonSchema): boolean => {
    const union: OpenApiV3_1.IJsonSchema[] = [];
    const already: Set<string> = new Set();
    const visit = (schema: OpenApi.IJsonSchema): void => {
      if (
        OpenApiTypeChecker.isBoolean(schema) ||
        OpenApiTypeChecker.isInteger(schema) ||
        OpenApiTypeChecker.isNumber(schema) ||
        OpenApiTypeChecker.isString(schema)
      )
        union.push({ ...schema });
      else if (
        OpenApiTypeChecker.isArray(schema) ||
        OpenApiTypeChecker.isTuple(schema) ||
        OpenApiTypeChecker.isObject(schema)
      )
        union.push(schema);
      else if (OpenApiTypeChecker.isOneOf(schema)) schema.oneOf.forEach(visit);
      else if (OpenApiTypeChecker.isReference(schema)) {
        if (already.has(schema.$ref)) union.push(schema);
        else {
          already.add(schema.$ref);
          const target: OpenApi.IJsonSchema | undefined =
            components.schemas?.[schema.$ref.split("/").pop()!];
          if (target === undefined) union.push(schema);
          else visit(target);
        }
      }
    };
    const visitConstant = (schema: OpenApi.IJsonSchema): void => {
      const insert = (value: any): void => {
        const matched: OpenApiV3_1.IJsonSchema.INumber | undefined = union.find(
          (u) =>
            (u as OpenApiV3.IJsonSchema.__ISignificant<any>).type ===
            typeof value,
        ) as OpenApiV3.IJsonSchema.INumber | undefined;
        if (matched !== undefined) {
          matched.enum ??= [];
          matched.enum.push(value);
        } else union.push({ type: typeof value as "number", enum: [value] });
      };
      if (OpenApiTypeChecker.isConstant(schema)) insert(schema.const);
      else if (OpenApiTypeChecker.isOneOf(schema))
        for (const u of schema.oneOf)
          if (OpenApiTypeChecker.isConstant(u)) insert(u.const);
    };
    visit(schema);
    visitConstant(schema);
    return union.length > 1;
  };
