import { OpenApi } from "../../OpenApi";
import { IGeminiSchema } from "../../structures/IGeminiSchema";
import { IJsonSchemaAttribute } from "../../structures/IJsonSchemaAttribute";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { ILlmSchemaV3_1 } from "../../structures/ILlmSchemaV3_1";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../structures/IResult";
import { GeminiTypeChecker } from "../../utils/GeminiTypeChecker";
import { LlmTypeCheckerV3_1 } from "../../utils/LlmTypeCheckerV3_1";
import { NamingConvention } from "../../utils/NamingConvention";
import { OpenApiTypeChecker } from "../../utils/OpenApiTypeChecker";
import { OpenApiValidator } from "../../utils/OpenApiValidator";
import { JsonDescriptionUtil } from "../../utils/internal/JsonDescriptionUtil";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace GeminiSchemaComposer {
  /** @internal */
  export const IS_DEFS = true;
  export const DEFAULT_CONFIG: IGeminiSchema.IConfig = {
    reference: true,
  };

  /* -----------------------------------------------------------
    CONVERTERS
  ----------------------------------------------------------- */
  export const parameters = (props: {
    config: IGeminiSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IGeminiSchema.IParameters, IOpenApiSchemaError> => {
    // validate
    const result: IResult<ILlmSchemaV3_1.IParameters, IOpenApiSchemaError> =
      LlmSchemaV3_1Composer.parameters({
        ...props,
        config: {
          reference: props.config.reference,
          constraint: false,
        },
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
      }) as IGeminiSchema.IParameters,
    };
  };

  export const schema = (props: {
    config: IGeminiSchema.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, IGeminiSchema>;
    schema: OpenApi.IJsonSchema;
    accessor?: string;
    refAccessor?: string;
  }): IResult<IGeminiSchema, IOpenApiSchemaError> => {
    // validate
    const oldbie: Set<string> = new Set(Object.keys(props.$defs));
    const result: IResult<ILlmSchemaV3_1, IOpenApiSchemaError> =
      LlmSchemaV3_1Composer.schema({
        ...props,
        config: {
          reference: props.config.reference,
          constraint: false,
        },
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

  /** @internal */
  export const transform = (props: {
    config: IGeminiSchema.IConfig;
    schema: ILlmSchemaV3_1;
  }): IGeminiSchema => {
    const union: Array<IGeminiSchema> = [];
    const attribute: IJsonSchemaAttribute = {
      title: props.schema.title,
      description: props.schema.description,
      example: props.schema.example,
      examples: props.schema.examples,
      ...Object.fromEntries(
        Object.entries(schema).filter(
          ([key, value]) => key.startsWith("x-") && value !== undefined,
        ),
      ),
    };
    const visit = (input: ILlmSchemaV3_1): void => {
      if (LlmTypeCheckerV3_1.isOneOf(input)) input.oneOf.forEach(visit);
      else if (LlmTypeCheckerV3_1.isArray(input))
        union.push({
          ...input,
          items: transform({
            config: props.config,
            schema: input.items,
          }),
        });
      else if (LlmTypeCheckerV3_1.isObject(input))
        union.push({
          ...input,
          properties: Object.fromEntries(
            Object.entries(input.properties).map(([key, value]) => [
              key,
              transform({
                config: props.config,
                schema: value,
              }),
            ]),
          ),
          additionalProperties:
            typeof input.additionalProperties === "object" &&
            input.additionalProperties !== null
              ? transform({
                  config: props.config,
                  schema: input.additionalProperties,
                })
              : (input.additionalProperties ?? false),
          description: JsonDescriptionUtil.take(input),
        });
      else if (LlmTypeCheckerV3_1.isConstant(input) === false)
        union.push(input);
    };
    const visitConstant = (input: ILlmSchemaV3_1): void => {
      const insert = (value: any): void => {
        const matched: IGeminiSchema.IString | undefined = union.find(
          (u) =>
            (u as (IJsonSchemaAttribute & { type: string }) | undefined)
              ?.type === typeof value,
        ) as IGeminiSchema.IString | undefined;
        if (matched !== undefined) {
          matched.enum ??= [];
          matched.enum.push(value);
        } else
          union.push({
            type: typeof value as "number",
            enum: [value],
          });
      };
      if (OpenApiTypeChecker.isConstant(input)) insert(input.const);
      else if (OpenApiTypeChecker.isOneOf(input))
        input.oneOf.forEach((s) => visitConstant(s as ILlmSchemaV3_1));
    };
    visit(props.schema);
    visitConstant(props.schema);
    if (union.length === 0)
      return {
        ...attribute,
        type: undefined,
      };
    else if (union.length === 1)
      return {
        ...attribute,
        ...union[0],
        description: GeminiTypeChecker.isReference(union[0]!)
          ? undefined
          : (union[0].description ?? attribute.description),
      };
    return {
      ...attribute,
      anyOf: union.map((u) => ({
        ...u,
        description: GeminiTypeChecker.isReference(u)
          ? undefined
          : u.description,
      })),
      "x-discriminator":
        LlmTypeCheckerV3_1.isOneOf(props.schema) &&
        props.schema.discriminator !== undefined &&
        props.schema.oneOf.length === union.length &&
        union.every(
          (e) =>
            GeminiTypeChecker.isReference(e) || GeminiTypeChecker.isNull(e),
        )
          ? props.schema.discriminator
          : undefined,
    };
  };

  /* -----------------------------------------------------------
    SEPARATORS
  ----------------------------------------------------------- */
  export const separateParameters = (props: {
    parameters: IGeminiSchema.IParameters;
    predicate: (schema: IGeminiSchema) => boolean;
    convention?: (key: string, type: "llm" | "human") => string;
    equals?: boolean;
  }): ILlmFunction.ISeparated<"chatgpt"> => {
    const convention =
      props.convention ??
      ((key, type) => `${key}.${NamingConvention.capitalize(type)}`);
    const [llm, human] = separateObject({
      predicate: props.predicate,
      convention,
      $defs: props.parameters.$defs,
      schema: props.parameters,
    });
    if (llm === null || human === null)
      return {
        llm: (llm as IGeminiSchema.IParameters | null) ?? {
          type: "object",
          properties: {} as Record<string, IGeminiSchema>,
          required: [],
          additionalProperties: false,
          $defs: {},
        },
        human: human as IGeminiSchema.IParameters | null,
      };
    const output: ILlmFunction.ISeparated<"chatgpt"> = {
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
    if (Object.keys(output.llm.properties).length !== 0) {
      const components: OpenApi.IComponents = {};
      output.validate = OpenApiValidator.create({
        components,
        schema: invert({
          components,
          schema: output.llm,
          $defs: output.llm.$defs,
        }),
        required: true,
        equals: props.equals,
      });
    }
    return output;
  };

  const separateStation = (props: {
    predicate: (schema: IGeminiSchema) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, IGeminiSchema>;
    schema: IGeminiSchema;
  }): [IGeminiSchema | null, IGeminiSchema | null] => {
    if (props.predicate(props.schema) === true) return [null, props.schema];
    else if (
      GeminiTypeChecker.isUnknown(props.schema) ||
      GeminiTypeChecker.isAnyOf(props.schema)
    )
      return [props.schema, null];
    else if (GeminiTypeChecker.isObject(props.schema))
      return separateObject({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema,
      });
    else if (GeminiTypeChecker.isArray(props.schema))
      return separateArray({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema,
      });
    else if (GeminiTypeChecker.isReference(props.schema))
      return separateReference({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema,
      });
    return [props.schema, null];
  };

  const separateArray = (props: {
    predicate: (schema: IGeminiSchema) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, IGeminiSchema>;
    schema: IGeminiSchema.IArray;
  }): [IGeminiSchema.IArray | null, IGeminiSchema.IArray | null] => {
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
    $defs: Record<string, IGeminiSchema>;
    predicate: (schema: IGeminiSchema) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    schema: IGeminiSchema.IObject;
  }): [IGeminiSchema.IObject | null, IGeminiSchema.IObject | null] => {
    // EMPTY OBJECT
    if (
      Object.keys(props.schema.properties ?? {}).length === 0 &&
      !!props.schema.additionalProperties === false
    )
      return [props.schema, null];

    const llm = {
      ...props.schema,
      properties: {} as Record<string, IGeminiSchema>,
      additionalProperties: props.schema.additionalProperties,
    } satisfies IGeminiSchema.IObject;
    const human = {
      ...props.schema,
      properties: {} as Record<string, IGeminiSchema>,
    } satisfies IGeminiSchema.IObject;

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
    predicate: (schema: IGeminiSchema) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, IGeminiSchema>;
    schema: IGeminiSchema.IReference;
  }): [IGeminiSchema.IReference | null, IGeminiSchema.IReference | null] => {
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
    const schema: IGeminiSchema = props.$defs?.[key]!;
    const [llm, human] = separateStation({
      predicate: props.predicate,
      convention: props.convention,
      $defs: props.$defs,
      schema,
    });
    if (llm !== null) Object.assign(props.$defs[llmKey], llm);
    if (human !== null) Object.assign(props.$defs[humanKey], human);

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

  const shrinkRequired = (s: IGeminiSchema.IObject): IGeminiSchema.IObject => {
    s.required = s.required.filter((key) => s.properties?.[key] !== undefined);
    return s;
  };

  /* -----------------------------------------------------------
    INVERTERS
  ----------------------------------------------------------- */
  export const invert = (props: {
    components: OpenApi.IComponents;
    schema: IGeminiSchema;
    $defs: Record<string, IGeminiSchema>;
  }): OpenApi.IJsonSchema => {
    const union: OpenApi.IJsonSchema[] = [];
    const attribute: IJsonSchemaAttribute = {
      title: props.schema.title,
      description: props.schema.description,
      ...Object.fromEntries(
        Object.entries(props.schema).filter(
          ([key, value]) => key.startsWith("x-") && value !== undefined,
        ),
      ),
      example: props.schema.example,
      examples: props.schema.examples,
    };

    const next = (schema: IGeminiSchema): OpenApi.IJsonSchema =>
      invert({
        components: props.components,
        $defs: props.$defs,
        schema,
      });
    const visit = (schema: IGeminiSchema): void => {
      if (GeminiTypeChecker.isArray(schema))
        union.push({
          ...schema,
          items: next(schema.items),
        });
      else if (GeminiTypeChecker.isObject(schema))
        union.push({
          ...schema,
          properties: Object.fromEntries(
            Object.entries(schema.properties).map(([key, value]) => [
              key,
              next(value),
            ]),
          ),
          additionalProperties:
            typeof schema.additionalProperties === "object" &&
            schema.additionalProperties !== null
              ? next(schema.additionalProperties)
              : schema.additionalProperties,
        });
      else if (GeminiTypeChecker.isAnyOf(schema)) schema.anyOf.forEach(visit);
      else if (GeminiTypeChecker.isReference(schema)) {
        const key: string = schema.$ref.split("#/$defs/")[1];
        if (props.components.schemas?.[key] === undefined) {
          props.components.schemas ??= {};
          props.components.schemas[key] = {};
          props.components.schemas[key] = next(props.$defs[key] ?? {});
        }
        union.push({
          ...schema,
          $ref: `#/components/schemas/${key}`,
        });
      } else if (GeminiTypeChecker.isBoolean(schema))
        if (!!schema.enum?.length)
          schema.enum.forEach((v) =>
            union.push({
              const: v,
            }),
          );
        else union.push(schema);
      else if (
        GeminiTypeChecker.isInteger(schema) ||
        GeminiTypeChecker.isNumber(schema)
      )
        if (!!schema.enum?.length)
          schema.enum.forEach((v) =>
            union.push({
              const: v,
            }),
          );
        else
          union.push({
            ...schema,
            ...{ enum: undefined },
          });
      else if (GeminiTypeChecker.isString(schema))
        if (!!schema.enum?.length)
          schema.enum.forEach((v) =>
            union.push({
              const: v,
            }),
          );
        else
          union.push({
            ...schema,
            ...{ enum: undefined },
          });
      else
        union.push({
          ...schema,
        });
    };
    visit(props.schema);

    return {
      ...attribute,
      ...(union.length === 0
        ? { type: undefined }
        : union.length === 1
          ? { ...union[0] }
          : {
              oneOf: union.map((u) => ({ ...u, nullable: undefined })),
              discriminator:
                GeminiTypeChecker.isAnyOf(props.schema) &&
                props.schema["x-discriminator"] !== undefined
                  ? {
                      property: props.schema["x-discriminator"],
                      mapping:
                        props.schema["x-discriminator"].mapping !== undefined
                          ? Object.fromEntries(
                              Object.entries(
                                props.schema["x-discriminator"].mapping,
                              ).map(([key, value]) => [
                                key,
                                `#/components/schemas/${value.split("/").at(-1)}`,
                              ]),
                            )
                          : undefined,
                    }
                  : undefined,
            }),
    };
  };
}
