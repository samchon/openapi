import { OpenApi } from "../OpenApi";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { LlmTypeCheckerV3 } from "../utils/LlmTypeCheckerV3";
import { OpenApiContraintShifter } from "../utils/OpenApiContraintShifter";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";
import { LlmParametersFinder } from "./LlmParametersFinder";
import { OpenApiV3Downgrader } from "./OpenApiV3Downgrader";

export namespace LlmConverterV3 {
  export const parameters = (props: {
    config: ILlmSchemaV3.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    errors?: string[];
    accessor?: string;
  }): ILlmSchemaV3.IParameters | null => {
    const entity: OpenApi.IJsonSchema.IObject | null =
      LlmParametersFinder.find(props);
    if (entity === null) return null;
    else if (!!entity.additionalProperties) {
      if (props.errors)
        props.errors.push(
          `${props.accessor ?? "$input"}.additionalProperties: LLM does not allow additional properties on parameters.`,
        );
      return null;
    }
    const res = schema({
      ...props,
      schema: entity,
    }) as ILlmSchemaV3.IParameters | null;
    if (res !== null) res.additionalProperties = false;
    return res;
  };

  export const schema = (props: {
    config: ILlmSchemaV3.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    errors?: string[];
    accessor?: string;
    refAccessor?: string;
    validate?: (schema: OpenApi.IJsonSchema, accessor: string) => boolean;
  }): ILlmSchemaV3 | null => {
    // CHECK TUPLE TYPE
    let valid: boolean = true;
    OpenApiTypeChecker.visit({
      closure: (next, accessor) => {
        if (props.validate && props.validate(next, accessor) === false)
          valid &&= false;
        if (OpenApiTypeChecker.isTuple(next)) {
          if (props.errors)
            props.errors.push(
              `${accessor ?? "$input"}: LLM does not allow tuple type.`,
            );
          valid &&= false;
        } else if (OpenApiTypeChecker.isReference(next)) {
          // UNABLE TO FIND MATCHED REFERENCE
          const key = next.$ref.split("#/components/schemas/")[1];
          if (props.components.schemas?.[key] === undefined) {
            if (props.errors !== undefined)
              props.errors.push(
                `${accessor}: unable to find reference type ${JSON.stringify(key)}.`,
              );
            valid &&= false;
          }
        }
      },
      components: props.components,
      schema: props.schema,
      accessor: props.accessor ?? "$input.schema",
      refAccessor: props.refAccessor ?? "$input.components.schemas",
    });
    if ((valid as boolean) === false) return null;

    // CHECK MISMATCHES
    const schema: OpenApi.IJsonSchema | null = OpenApiTypeChecker.escape({
      ...props,
      recursive: props.config.recursive,
    });
    if (schema === null) return null; // UNREACHABLE

    // SPECIALIZATIONS
    const downgraded: ILlmSchemaV3 = OpenApiV3Downgrader.downgradeSchema({
      original: {
        schemas: {},
      },
      downgraded: {},
    })(schema) as ILlmSchemaV3;
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
        } else if (
          props.config.constraint === false &&
          (LlmTypeCheckerV3.isInteger(next) || LlmTypeCheckerV3.isNumber(next))
        )
          OpenApiContraintShifter.shiftNumeric(
            next as OpenApi.IJsonSchema.IInteger | OpenApi.IJsonSchema.INumber,
          );
        else if (
          props.config.constraint === false &&
          LlmTypeCheckerV3.isString(next)
        )
          OpenApiContraintShifter.shiftString(
            next as OpenApi.IJsonSchema.IString,
          );
      },
      schema: downgraded,
    });
    return downgraded;
  };

  export const separate = (props: {
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
    const [x, y] = separate({
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
    if (
      !!props.schema.additionalProperties ||
      Object.keys(props.schema.properties ?? {}).length === 0
    )
      return [props.schema, null];
    const llm = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3>,
    } satisfies ILlmSchemaV3.IObject;
    const human = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3>,
    } satisfies ILlmSchemaV3.IObject;
    for (const [key, value] of Object.entries(props.schema.properties ?? {})) {
      const [x, y] = separate({
        predicate: props.predicate,
        schema: value,
      });
      if (x !== null) llm.properties[key] = x;
      if (y !== null) human.properties[key] = y;
    }
    return [
      Object.keys(llm.properties).length === 0 ? null : shrinkRequired(llm),
      Object.keys(human.properties).length === 0 ? null : shrinkRequired(human),
    ];
  };

  const shrinkRequired = (s: ILlmSchemaV3.IObject): ILlmSchemaV3.IObject => {
    s.required = s.required.filter((key) => s.properties[key] !== undefined);
    return s;
  };
}
