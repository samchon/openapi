import { OpenApi } from "../../OpenApi";
import { OpenApiV3Downgrader } from "../../converters/OpenApiV3Downgrader";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { ILlmSchemaV3 } from "../../structures/ILlmSchemaV3";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../typings/IResult";
import { LlmTypeCheckerV3 } from "../../utils/LlmTypeCheckerV3";
import { OpenApiConstraintShifter } from "../../utils/OpenApiConstraintShifter";
import { OpenApiTypeChecker } from "../../utils/OpenApiTypeChecker";
import { LlmParametersFinder } from "./LlmParametersComposer";

export namespace LlmSchemaV3Composer {
  /**
   * @internal
   */
  export const IS_DEFS = false;

  export const parameters = (props: {
    config: ILlmSchemaV3.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    /** @internal */
    validate?: (
      schema: OpenApi.IJsonSchema,
      accessor: string,
    ) => IOpenApiSchemaError.IReason[];
    accessor?: string;
    refAccessor?: string;
  }): IResult<ILlmSchemaV3.IParameters, IOpenApiSchemaError> => {
    const entity: IResult<OpenApi.IJsonSchema.IObject, IOpenApiSchemaError> =
      LlmParametersFinder.parameters({
        ...props,
        method: "LlmSchemaV3Composer.parameters",
      });
    if (entity.success === false) return entity;

    const result: IResult<ILlmSchemaV3, IOpenApiSchemaError> = schema({
      ...props,
      schema: entity.value,
    });
    if (result.success === false) return result;
    return {
      success: true,
      value: {
        ...(result.value as ILlmSchemaV3.IObject),
        additionalProperties: false,
      } satisfies ILlmSchemaV3.IParameters,
    };
  };

  export const schema = (props: {
    config: ILlmSchemaV3.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    /** @internal */
    validate?: (
      schema: OpenApi.IJsonSchema,
      accessor: string,
    ) => IOpenApiSchemaError.IReason[];
    accessor?: string;
    refAccessor?: string;
  }): IResult<ILlmSchemaV3, IOpenApiSchemaError> => {
    // CHECK TUPLE TYPE
    const reasons: IOpenApiSchemaError.IReason[] = [];
    OpenApiTypeChecker.visit({
      closure: (next, accessor) => {
        if (props.validate) reasons.push(...props.validate(next, accessor));
        if (OpenApiTypeChecker.isTuple(next))
          reasons.push({
            accessor: accessor,
            schema: next,
            message: "LLM does not allow tuple type.",
          });
        else if (OpenApiTypeChecker.isReference(next)) {
          // UNABLE TO FIND MATCHED REFERENCE
          const key = next.$ref.split("#/components/schemas/")[1];
          if (props.components.schemas?.[key] === undefined) {
            reasons.push({
              schema: next,
              message: `${accessor}: unable to find reference type ${JSON.stringify(key)}.`,
              accessor: accessor,
            });
          }
        }
      },
      components: props.components,
      schema: props.schema,
      accessor: props.accessor,
      refAccessor: props.refAccessor,
    });
    // if ((valid as boolean) === false) return null;
    if (reasons.length > 0)
      return {
        success: false,
        error: {
          method: "LlmSchemaV3Composer.schema",
          message: "Failed to compose LLM schema of v3",
          reasons,
        },
      };

    // CHECK MISMATCHES
    const escaped: IResult<OpenApi.IJsonSchema, IOpenApiSchemaError> =
      OpenApiTypeChecker.escape({
        ...props,
        recursive: props.config.recursive,
      });
    if (escaped.success === false)
      // UNREACHABLE
      return {
        success: false,
        error: {
          method: "LlmSchemaV3Composer.schema",
          message: "Failed to compose LLM schema of v3",
          reasons: escaped.error.reasons,
        },
      };

    // SPECIALIZATIONS
    const downgraded: ILlmSchemaV3 = OpenApiV3Downgrader.downgradeSchema({
      original: {
        schemas: {},
      },
      downgraded: {},
    })(escaped.value) as ILlmSchemaV3;
    LlmTypeCheckerV3.visit({
      closure: (next) => {
        if (
          LlmTypeCheckerV3.isOneOf(next) &&
          (next as any).discriminator !== undefined
        )
          delete (next as any).discriminator;
        else if (LlmTypeCheckerV3.isObject(next)) {
          next.properties ??= {};
          next.required ??= [];
        }
        if (props.config.constraint === false) {
          if (
            LlmTypeCheckerV3.isInteger(next) ||
            LlmTypeCheckerV3.isNumber(next)
          )
            OpenApiConstraintShifter.shiftNumeric(
              next as
                | OpenApi.IJsonSchema.IInteger
                | OpenApi.IJsonSchema.INumber,
            );
          else if (LlmTypeCheckerV3.isString(next))
            OpenApiConstraintShifter.shiftString(
              next as OpenApi.IJsonSchema.IString,
            );
          else if (LlmTypeCheckerV3.isArray(next))
            OpenApiConstraintShifter.shiftArray(
              next as OpenApi.IJsonSchema.IArray,
            );
        }
      },
      schema: downgraded,
    });
    return {
      success: true,
      value: downgraded,
    };
  };

  export const separateParameters = (props: {
    predicate: (schema: ILlmSchemaV3) => boolean;
    parameters: ILlmSchemaV3.IParameters;
  }): ILlmFunction.ISeparated<"3.0"> => {
    const [llm, human] = separateObject({
      predicate: props.predicate,
      schema: props.parameters,
    });
    return {
      llm: (llm as ILlmSchemaV3.IParameters | null) ?? {
        type: "object",
        properties: {},
        additionalProperties: false,
        required: [],
      },
      human: human as ILlmSchemaV3.IParameters | null,
    };
  };

  const separateStation = (props: {
    predicate: (schema: ILlmSchemaV3) => boolean;
    schema: ILlmSchemaV3;
  }): [ILlmSchemaV3 | null, ILlmSchemaV3 | null] => {
    if (props.predicate(props.schema) === true) return [null, props.schema];
    else if (
      LlmTypeCheckerV3.isUnknown(props.schema) ||
      LlmTypeCheckerV3.isOneOf(props.schema)
    )
      return [props.schema, null];
    else if (LlmTypeCheckerV3.isObject(props.schema))
      return separateObject({
        predicate: props.predicate,
        schema: props.schema,
      });
    else if (LlmTypeCheckerV3.isArray(props.schema))
      return separateArray({
        predicate: props.predicate,
        schema: props.schema,
      });
    return [props.schema, null];
  };

  const separateArray = (props: {
    predicate: (schema: ILlmSchemaV3) => boolean;
    schema: ILlmSchemaV3.IArray;
  }): [ILlmSchemaV3.IArray | null, ILlmSchemaV3.IArray | null] => {
    const [x, y] = separateStation({
      predicate: props.predicate,
      schema: props.schema.items,
    });
    return [
      x !== null
        ? {
            ...props.schema,
            items: x,
          }
        : null,
      y !== null
        ? {
            ...props.schema,
            items: y,
          }
        : null,
    ];
  };

  const separateObject = (props: {
    predicate: (schema: ILlmSchemaV3) => boolean;
    schema: ILlmSchemaV3.IObject;
  }): [ILlmSchemaV3.IObject | null, ILlmSchemaV3.IObject | null] => {
    // EMPTY OBJECT
    if (
      Object.keys(props.schema.properties ?? {}).length === 0 &&
      !!props.schema.additionalProperties === false
    )
      return [props.schema, null];

    const llm = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3>,
      additionalProperties: props.schema.additionalProperties,
    } satisfies ILlmSchemaV3.IObject;
    const human = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3>,
      additionalProperties: props.schema.additionalProperties,
    } satisfies ILlmSchemaV3.IObject;

    for (const [key, value] of Object.entries(props.schema.properties ?? {})) {
      const [x, y] = separateStation({
        predicate: props.predicate,
        schema: value,
      });
      if (x !== null) llm.properties[key] = x;
      if (y !== null) human.properties[key] = y;
    }
    if (
      typeof props.schema.additionalProperties === "object" &&
      props.schema.additionalProperties !== null
    ) {
      const [dx, dy] = separateStation({
        predicate: props.predicate,
        schema: props.schema.additionalProperties,
      });
      llm.additionalProperties = dx ?? false;
      human.additionalProperties = dy ?? false;
    }
    return [
      !!Object.keys(llm.properties).length || !!llm.additionalProperties
        ? shrinkRequired(llm)
        : null,
      !!Object.keys(human.properties).length || !!human.additionalProperties
        ? shrinkRequired(human)
        : null,
    ];
  };

  const shrinkRequired = (s: ILlmSchemaV3.IObject): ILlmSchemaV3.IObject => {
    s.required = s.required.filter((key) => s.properties[key] !== undefined);
    return s;
  };
}
