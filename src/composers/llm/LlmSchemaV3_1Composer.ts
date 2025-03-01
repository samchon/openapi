import { OpenApi } from "../../OpenApi";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { ILlmSchemaV3_1 } from "../../structures/ILlmSchemaV3_1";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../structures/IResult";
import { LlmTypeCheckerV3_1 } from "../../utils/LlmTypeCheckerV3_1";
import { NamingConvention } from "../../utils/NamingConvention";
import { OpenApiConstraintShifter } from "../../utils/OpenApiConstraintShifter";
import { OpenApiTypeChecker } from "../../utils/OpenApiTypeChecker";
import { JsonDescriptionUtil } from "../../utils/internal/JsonDescriptionUtil";
import { LlmDescriptionInverter } from "./LlmDescriptionInverter";
import { LlmParametersFinder } from "./LlmParametersComposer";

export namespace LlmSchemaV3_1Composer {
  /**
   * @internal
   */
  export const IS_DEFS = true;

  /* -----------------------------------------------------------
    CONVERTERS
  ----------------------------------------------------------- */
  export const parameters = (props: {
    config: ILlmSchemaV3_1.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    errors?: string[];
    /** @internal */
    validate?: (
      input: OpenApi.IJsonSchema,
      accessor: string,
    ) => IOpenApiSchemaError.IReason[];
    accessor?: string;
    refAccessor?: string;
  }): IResult<ILlmSchemaV3_1.IParameters, IOpenApiSchemaError> => {
    const entity: IResult<OpenApi.IJsonSchema.IObject, IOpenApiSchemaError> =
      LlmParametersFinder.parameters({
        ...props,
        method: "LlmSchemaV3_1Composer.parameters",
      });
    if (entity.success === false) return entity;

    const $defs: Record<string, ILlmSchemaV3_1> = {};
    const result: IResult<ILlmSchemaV3_1, IOpenApiSchemaError> = schema({
      ...props,
      $defs,
      schema: entity.value,
    });
    if (result.success === false) return result;
    return {
      success: true,
      value: {
        ...(result.value as ILlmSchemaV3_1.IObject),
        additionalProperties: false,
        $defs,
      } satisfies ILlmSchemaV3_1.IParameters,
    };
  };

  export const schema = (props: {
    config: ILlmSchemaV3_1.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, ILlmSchemaV3_1>;
    schema: OpenApi.IJsonSchema;
    /** @internal */
    validate?: (
      input: OpenApi.IJsonSchema,
      accessor: string,
    ) => IOpenApiSchemaError.IReason[];
    accessor?: string;
    refAccessor?: string;
  }): IResult<ILlmSchemaV3_1, IOpenApiSchemaError> => {
    const union: Array<ILlmSchemaV3_1 | null> = [];
    const attribute: ILlmSchemaV3_1.__IAttribute = {
      title: props.schema.title,
      description: props.schema.description,
      example: props.schema.example,
      examples: props.schema.examples,
      ...Object.fromEntries(
        Object.entries(props.schema).filter(
          ([key, value]) => key.startsWith("x-") && value !== undefined,
        ),
      ),
    };

    const reasons: IOpenApiSchemaError.IReason[] = [];
    OpenApiTypeChecker.visit({
      closure: (next, accessor) => {
        if (props.validate) {
          // CUSTOM VALIDATION
          reasons.push(...props.validate(next, accessor));
        }
        if (OpenApiTypeChecker.isTuple(next))
          reasons.push({
            schema: next,
            accessor: accessor,
            message: `LLM does not allow tuple type.`,
          });
        else if (OpenApiTypeChecker.isReference(next)) {
          // UNABLE TO FIND MATCHED REFERENCE
          const key = next.$ref.split("#/components/schemas/")[1];
          if (props.components.schemas?.[key] === undefined)
            reasons.push({
              schema: next,
              accessor: accessor,
              message: `unable to find reference type ${JSON.stringify(key)}.`,
            });
        }
      },
      components: props.components,
      schema: props.schema,
      accessor: props.accessor,
      refAccessor: props.refAccessor,
    });
    if (reasons.length > 0)
      return {
        success: false,
        error: {
          method: "LlmSchemaV3_1Composer.schema",
          message: "Failed to compose LLM schema of v3.1",
          reasons,
        },
      };

    const visit = (input: OpenApi.IJsonSchema, accessor: string): number => {
      if (OpenApiTypeChecker.isOneOf(input)) {
        // UNION TYPE
        input.oneOf.forEach((s, i) => visit(s, `${accessor}.oneOf[${i}]`));
        return 0;
      } else if (OpenApiTypeChecker.isReference(input)) {
        // REFERENCE TYPE
        const key: string = input.$ref.split("#/components/schemas/")[1];
        const target: OpenApi.IJsonSchema | undefined =
          props.components.schemas?.[key];
        if (target === undefined)
          return union.push(null); // UNREACHABLEE
        else if (
          // KEEP THE REFERENCE TYPE
          props.config.reference === true ||
          OpenApiTypeChecker.isRecursiveReference({
            components: props.components,
            schema: input,
          })
        ) {
          const out = () =>
            union.push({
              ...input,
              $ref: `#/$defs/${key}`,
            });
          if (props.$defs[key] !== undefined) return out();
          props.$defs[key] = {};
          const converted: IResult<ILlmSchemaV3_1, IOpenApiSchemaError> =
            schema({
              config: props.config,
              components: props.components,
              $defs: props.$defs,
              schema: target,
              refAccessor: props.refAccessor,
              accessor: `${props.refAccessor ?? "$def"}[${JSON.stringify(key)}]`,
            });
          if (converted.success === false) return union.push(null); // UNREACHABLE
          props.$defs[key] = converted.value;
          return out();
        } else {
          // DISCARD THE REFERENCE TYPE
          const length: number = union.length;
          visit(target, accessor);
          if (length === union.length - 1 && union[union.length - 1] !== null)
            union[union.length - 1] = {
              ...union[union.length - 1]!,
              description: JsonDescriptionUtil.cascade({
                prefix: "#/components/schemas/",
                components: props.components,
                $ref: input.$ref,
                description: union[union.length - 1]!.description,
                escape: true,
              }),
            };
          else
            attribute.description = JsonDescriptionUtil.cascade({
              prefix: "#/components/schemas/",
              components: props.components,
              $ref: input.$ref,
              description: attribute.description,
              escape: true,
            });
          return union.length;
        }
      } else if (OpenApiTypeChecker.isObject(input)) {
        // OBJECT TYPE
        const properties: Record<string, ILlmSchemaV3_1 | null> =
          Object.entries(input.properties ?? {}).reduce(
            (acc, [key, value]) => {
              const converted: IResult<ILlmSchemaV3_1, IOpenApiSchemaError> =
                schema({
                  config: props.config,
                  components: props.components,
                  $defs: props.$defs,
                  schema: value,
                  refAccessor: props.refAccessor,
                  accessor: `${accessor}.properties[${JSON.stringify(key)}]`,
                });
              acc[key] = converted.success ? converted.value : null;
              if (converted.success === false)
                reasons.push(...converted.error.reasons);
              return acc;
            },
            {} as Record<string, ILlmSchemaV3_1 | null>,
          );
        if (Object.values(properties).some((v) => v === null))
          return union.push(null);
        const additionalProperties:
          | ILlmSchemaV3_1
          | boolean
          | null
          | undefined = (() => {
          if (
            typeof input.additionalProperties === "object" &&
            input.additionalProperties !== null
          ) {
            const converted: IResult<ILlmSchemaV3_1, IOpenApiSchemaError> =
              schema({
                config: props.config,
                components: props.components,
                $defs: props.$defs,
                schema: input.additionalProperties,
                refAccessor: props.refAccessor,
                accessor: `${accessor}.additionalProperties`,
              });
            if (converted.success === false) {
              reasons.push(...converted.error.reasons);
              return null;
            }
            return converted.value;
          }
          return input.additionalProperties;
        })();
        if (additionalProperties === null) return union.push(null);
        return union.push({
          ...input,
          properties: properties as Record<string, ILlmSchemaV3_1>,
          additionalProperties,
          required: input.required ?? [],
        });
      } else if (OpenApiTypeChecker.isArray(input)) {
        const items: IResult<ILlmSchemaV3_1, IOpenApiSchemaError> = schema({
          config: props.config,
          components: props.components,
          $defs: props.$defs,
          schema: input.items,
          refAccessor: props.refAccessor,
          accessor: `${accessor}.items`,
        });
        if (items.success === false) {
          reasons.push(...items.error.reasons);
          return union.push(null);
        }
        return union.push(
          (props.config.constraint
            ? (x: ILlmSchemaV3_1.IArray) => x
            : (x: ILlmSchemaV3_1.IArray) =>
                OpenApiConstraintShifter.shiftArray(x))({
            ...input,
            items: items.value,
          }),
        );
      } else if (OpenApiTypeChecker.isString(input))
        return union.push(
          (props.config.constraint
            ? (x: ILlmSchemaV3_1.IString) => x
            : (x: ILlmSchemaV3_1.IString) =>
                OpenApiConstraintShifter.shiftString(x))({
            ...input,
          }),
        );
      else if (
        OpenApiTypeChecker.isNumber(input) ||
        OpenApiTypeChecker.isInteger(input)
      )
        return union.push(
          (props.config.constraint
            ? (x: ILlmSchemaV3_1.INumber | ILlmSchemaV3_1.IInteger) => x
            : (x: ILlmSchemaV3_1.INumber | ILlmSchemaV3_1.IInteger) =>
                OpenApiConstraintShifter.shiftNumeric(x))({
            ...input,
          }),
        );
      else if (OpenApiTypeChecker.isTuple(input))
        return union.push(null); // UNREACHABLE
      else return union.push({ ...input });
    };
    visit(props.schema, props.accessor ?? "$input.schema");

    if (union.some((u) => u === null))
      return {
        success: false,
        error: {
          method: "LlmSchemaV3_1Composer.schema",
          message: "Failed to compose LLM schema of v3.1",
          reasons,
        },
      };
    else if (union.length === 0)
      return {
        success: true,
        value: {
          ...attribute,
          type: undefined,
        },
      };
    else if (union.length === 1)
      return {
        success: true,
        value: {
          ...attribute,
          ...union[0]!,
          description: LlmTypeCheckerV3_1.isReference(union[0]!)
            ? undefined
            : union[0]!.description,
        },
      };
    return {
      success: true,
      value: {
        ...attribute,
        oneOf: union.map((u) => ({
          ...u!,
          description: LlmTypeCheckerV3_1.isReference(u!)
            ? undefined
            : u!.description,
        })),
      },
    };
  };

  /* -----------------------------------------------------------
    SEPARATORS
  ----------------------------------------------------------- */
  export const separateParameters = (props: {
    parameters: ILlmSchemaV3_1.IParameters;
    predicate: (schema: ILlmSchemaV3_1) => boolean;
    convention?: (key: string, type: "llm" | "human") => string;
  }): ILlmFunction.ISeparated<"3.1"> => {
    const convention =
      props.convention ??
      ((key, type) => `${key}.${NamingConvention.capitalize(type)}`);
    const [llm, human] = separateObject({
      $defs: props.parameters.$defs,
      schema: props.parameters,
      predicate: props.predicate,
      convention,
    });
    if (llm === null || human === null)
      return {
        llm: (llm as ILlmSchemaV3_1.IParameters | null) ?? {
          type: "object",
          properties: {},
          additionalProperties: false,
          required: [],
          $defs: {},
        },
        human: human as ILlmSchemaV3_1.IParameters | null,
      };
    const output: ILlmFunction.ISeparated<"3.1"> = {
      llm: {
        ...llm,
        $defs: Object.fromEntries(
          Object.entries(props.parameters.$defs).filter(([key]) =>
            key.endsWith(".Llm"),
          ),
        ),
        additionalProperties: false,
      },
      human: {
        ...human,
        $defs: Object.fromEntries(
          Object.entries(props.parameters.$defs).filter(([key]) =>
            key.endsWith(".Human"),
          ),
        ),
        additionalProperties: false,
      },
    };
    for (const key of Object.keys(props.parameters.$defs))
      if (key.endsWith(".Llm") === false && key.endsWith(".Human") === false)
        delete props.parameters.$defs[key];
    return output;
  };

  const separateStation = (props: {
    predicate: (schema: ILlmSchemaV3_1) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, ILlmSchemaV3_1>;
    schema: ILlmSchemaV3_1;
  }): [ILlmSchemaV3_1 | null, ILlmSchemaV3_1 | null] => {
    if (props.predicate(props.schema) === true) return [null, props.schema];
    else if (
      LlmTypeCheckerV3_1.isUnknown(props.schema) ||
      LlmTypeCheckerV3_1.isOneOf(props.schema)
    )
      return [props.schema, null];
    else if (LlmTypeCheckerV3_1.isObject(props.schema))
      return separateObject({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema,
      });
    else if (LlmTypeCheckerV3_1.isArray(props.schema))
      return separateArray({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema,
      });
    else if (LlmTypeCheckerV3_1.isReference(props.schema))
      return separateReference({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema,
      });
    return [props.schema, null];
  };

  const separateArray = (props: {
    predicate: (schema: ILlmSchemaV3_1) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, ILlmSchemaV3_1>;
    schema: ILlmSchemaV3_1.IArray;
  }): [ILlmSchemaV3_1.IArray | null, ILlmSchemaV3_1.IArray | null] => {
    const [x, y] = separateStation({
      predicate: props.predicate,
      convention: props.convention,
      $defs: props.$defs,
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
    predicate: (schema: ILlmSchemaV3_1) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, ILlmSchemaV3_1>;
    schema: ILlmSchemaV3_1.IObject;
  }): [ILlmSchemaV3_1.IObject | null, ILlmSchemaV3_1.IObject | null] => {
    // EMPTY OBJECT
    if (
      Object.keys(props.schema.properties ?? {}).length === 0 &&
      !!props.schema.additionalProperties === false
    )
      return [props.schema, null];

    const llm = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3_1>,
      additionalProperties: props.schema.additionalProperties,
    } satisfies ILlmSchemaV3_1.IObject;
    const human = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3_1>,
    } satisfies ILlmSchemaV3_1.IObject;

    for (const [key, value] of Object.entries(props.schema.properties ?? {})) {
      const [x, y] = separateStation({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
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
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema.additionalProperties,
      });
      llm.additionalProperties = dx ?? false;
      human.additionalProperties = dy ?? false;
    }
    return [
      !!Object.keys(llm.properties).length || !!llm.additionalProperties
        ? shrinkRequired(llm)
        : null,
      !!Object.keys(human.properties).length || human.additionalProperties
        ? shrinkRequired(human)
        : null,
    ];
  };

  const separateReference = (props: {
    predicate: (schema: ILlmSchemaV3_1) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, ILlmSchemaV3_1>;
    schema: ILlmSchemaV3_1.IReference;
  }): [ILlmSchemaV3_1.IReference | null, ILlmSchemaV3_1.IReference | null] => {
    const key: string = props.schema.$ref.split("#/$defs/")[1];
    const humanKey: string = props.convention(key, "human");
    const llmKey: string = props.convention(key, "llm");

    // FIND EXISTING
    if (props.$defs?.[humanKey] || props.$defs?.[llmKey])
      return [
        props.$defs?.[llmKey]
          ? {
              ...props.schema,
              $ref: `#/$defs/${llmKey}`,
            }
          : null,
        props.$defs?.[humanKey]
          ? {
              ...props.schema,
              $ref: `#/$defs/${humanKey}`,
            }
          : null,
      ];

    // PRE-ASSIGNMENT
    props.$defs![llmKey] = {};
    props.$defs![humanKey] = {};

    // DO COMPOSE
    const schema: ILlmSchemaV3_1 = props.$defs?.[key]!;
    const [llm, human] = separateStation({
      predicate: props.predicate,
      convention: props.convention,
      $defs: props.$defs,
      schema,
    });

    // ONLY ONE
    if (llm === null || human === null) {
      delete props.$defs[llmKey];
      delete props.$defs[humanKey];
      return llm === null ? [null, props.schema] : [props.schema, null];
    }

    // BOTH OF THEM
    return [
      llm !== null
        ? {
            ...props.schema,
            $ref: `#/$defs/${llmKey}`,
          }
        : null,
      human !== null
        ? {
            ...props.schema,
            $ref: `#/$defs/${humanKey}`,
          }
        : null,
    ];
  };

  const shrinkRequired = (
    s: ILlmSchemaV3_1.IObject,
  ): ILlmSchemaV3_1.IObject => {
    if (s.required !== undefined)
      s.required = s.required.filter(
        (key) => s.properties?.[key] !== undefined,
      );
    return s;
  };

  /* -----------------------------------------------------------
    INVERTERS
  ----------------------------------------------------------- */
  export const invert = (props: {
    components: OpenApi.IComponents;
    schema: ILlmSchemaV3_1;
    $defs: Record<string, ILlmSchemaV3_1>;
  }): OpenApi.IJsonSchema => {
    const next = (schema: ILlmSchemaV3_1): OpenApi.IJsonSchema =>
      invert({
        components: props.components,
        $defs: props.$defs,
        schema,
      });
    if (LlmTypeCheckerV3_1.isArray(props.schema))
      return {
        ...LlmDescriptionInverter.array(props.schema.description ?? ""),
        ...props.schema,
        items: next(props.schema.items),
      };
    else if (LlmTypeCheckerV3_1.isObject(props.schema))
      return {
        ...props.schema,
        properties: props.schema.properties
          ? Object.fromEntries(
              Object.entries(props.schema.properties).map(([key, value]) => [
                key,
                next(value),
              ]),
            )
          : undefined,
        additionalProperties:
          typeof props.schema.additionalProperties === "object" &&
          props.schema.additionalProperties !== null
            ? next(props.schema.additionalProperties)
            : props.schema.additionalProperties,
      };
    else if (LlmTypeCheckerV3_1.isReference(props.schema)) {
      const key: string = props.schema.$ref.split("#/$defs/").at(-1) ?? "";
      if (props.components.schemas?.[key] === undefined) {
        props.components.schemas ??= {};
        props.components.schemas[key] = {};
        props.components.schemas[key] = next(props.$defs[key] ?? {});
      }
      return {
        ...props.schema,
        $ref: `#/components/schemas/${key}`,
      };
    } else if (
      LlmTypeCheckerV3_1.isInteger(props.schema) ||
      LlmTypeCheckerV3_1.isNumber(props.schema)
    )
      return {
        ...LlmDescriptionInverter.numeric(props.schema.description ?? ""),
        ...props.schema,
      };
    else if (LlmTypeCheckerV3_1.isString(props.schema))
      return {
        ...LlmDescriptionInverter.string(props.schema.description ?? ""),
        ...props.schema,
      };
    return props.schema;
  };
}
