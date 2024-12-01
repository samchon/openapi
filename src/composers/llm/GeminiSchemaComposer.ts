import { OpenApi } from "../../OpenApi";
import { OpenApiV3 } from "../../OpenApiV3";
import { OpenApiV3_1 } from "../../OpenApiV3_1";
import { IGeminiSchema } from "../../structures/IGeminiSchema";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { ILlmSchemaV3 } from "../../structures/ILlmSchemaV3";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../typings/IResult";
import { LlmTypeCheckerV3 } from "../../utils/LlmTypeCheckerV3";
import { OpenApiTypeChecker } from "../../utils/OpenApiTypeChecker";
import { LlmParametersFinder } from "./LlmParametersComposer";
import { LlmSchemaV3Composer } from "./LlmSchemaV3Composer";

export namespace GeminiSchemaComposer {
  export const parameters = (props: {
    config: IGeminiSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IGeminiSchema.IParameters, IOpenApiSchemaError> => {
    const entity: IResult<OpenApi.IJsonSchema.IObject, IOpenApiSchemaError> =
      LlmParametersFinder.parameters({
        ...props,
        method: "GeminiSchemaComposer.parameters",
      });
    if (entity.success === false) return entity;
    return schema({
      ...props,
      schema: entity.value,
    }) as IResult<IGeminiSchema.IParameters, IOpenApiSchemaError>;
  };

  export const schema = (props: {
    config: IGeminiSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IGeminiSchema, IOpenApiSchemaError> => {
    // TRANSFORM TO LLM SCHEMA OF V3.0
    const result: IResult<ILlmSchemaV3, IOpenApiSchemaError> =
      LlmSchemaV3Composer.schema({
        ...props,
        config: {
          recursive: props.config.recursive,
          constraint: false,
        },
        validate: (next, accessor): IOpenApiSchemaError.IReason[] => {
          if (OpenApiTypeChecker.isObject(next)) {
            if (!!next.additionalProperties)
              return [
                {
                  schema: next,
                  accessor: `${accessor}.additionalProperties`,
                  message: "Gemini does not allow additionalProperties.",
                },
              ];
          } else if (
            OpenApiTypeChecker.isOneOf(next) &&
            isOneOf(props.components)(next)
          )
            return [
              {
                schema: next,
                accessor: accessor,
                message: "Gemini does not allow union type.",
              },
            ];
          return [];
        },
      });
    if (result.success === false) return result;

    // SPECIALIZATIONS
    LlmTypeCheckerV3.visit({
      schema: result.value,
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
    });

    // DO NOT ALLOW UNION TYPE
    return result;
  };

  export const separateParameters = (props: {
    predicate: (schema: IGeminiSchema) => boolean;
    parameters: IGeminiSchema.IParameters;
  }): ILlmFunction.ISeparated<"gemini"> =>
    LlmSchemaV3Composer.separateParameters(
      props as {
        predicate: (schema: ILlmSchemaV3) => boolean;
        parameters: ILlmSchemaV3.IParameters;
      },
    ) as any as ILlmFunction.ISeparated<"gemini">;
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
