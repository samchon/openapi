import { OpenApi } from "../../OpenApi";
import { IChatGptSchema } from "../../structures/IChatGptSchema";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { ILlmSchemaV3_1 } from "../../structures/ILlmSchemaV3_1";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../structures/IResult";
import { ChatGptTypeChecker } from "../../utils/ChatGptTypeChecker";
import { LlmTypeCheckerV3_1 } from "../../utils/LlmTypeCheckerV3_1";
import { NamingConvention } from "../../utils/NamingConvention";
import { OpenApiTypeChecker } from "../../utils/OpenApiTypeChecker";
import { OpenApiValidator } from "../../utils/OpenApiValidator";
import { LlmDescriptionInverter } from "./LlmDescriptionInverter";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace ChatGptSchemaComposer {
  /**
   * @internal
   */
  export const IS_DEFS = true;

  /* -----------------------------------------------------------
    CONVERTERS
  ----------------------------------------------------------- */
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
    const union: Array<IChatGptSchema> = [];
    const attribute: IChatGptSchema.__IAttribute = {
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
            props.config.strict === true
              ? false
              : typeof input.additionalProperties === "object" &&
                  input.additionalProperties !== null
                ? transform({
                    config: props.config,
                    schema: input.additionalProperties,
                  })
                : input.additionalProperties,
        });
      else if (LlmTypeCheckerV3_1.isConstant(input) === false)
        union.push(input);
    };
    const visitConstant = (input: ILlmSchemaV3_1): void => {
      const insert = (value: any): void => {
        const matched: IChatGptSchema.IString | undefined = union.find(
          (u) =>
            (u as IChatGptSchema.__ISignificant<any> | undefined)?.type ===
            typeof value,
        ) as IChatGptSchema.IString | undefined;
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
        description: ChatGptTypeChecker.isReference(union[0]!)
          ? undefined
          : (union[0].description ?? attribute.description),
      };
    return {
      ...attribute,
      anyOf: union.map((u) => ({
        ...u,
        description: ChatGptTypeChecker.isReference(u)
          ? undefined
          : u.description,
      })),
    };
  };

  /* -----------------------------------------------------------
    SEPARATORS
  ----------------------------------------------------------- */
  export const separateParameters = (props: {
    parameters: IChatGptSchema.IParameters;
    predicate: (schema: IChatGptSchema) => boolean;
    convention?: (key: string, type: "llm" | "human") => string;
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
        llm: (llm as IChatGptSchema.IParameters | null) ?? {
          type: "object",
          properties: {} as Record<string, IChatGptSchema>,
          required: [],
          additionalProperties: false,
          $defs: {},
        },
        human: human as IChatGptSchema.IParameters | null,
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
      });
    }
    return output;
  };

  const separateStation = (props: {
    predicate: (schema: IChatGptSchema) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, IChatGptSchema>;
    schema: IChatGptSchema;
  }): [IChatGptSchema | null, IChatGptSchema | null] => {
    if (props.predicate(props.schema) === true) return [null, props.schema];
    else if (
      ChatGptTypeChecker.isUnknown(props.schema) ||
      ChatGptTypeChecker.isAnyOf(props.schema)
    )
      return [props.schema, null];
    else if (ChatGptTypeChecker.isObject(props.schema))
      return separateObject({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema,
      });
    else if (ChatGptTypeChecker.isArray(props.schema))
      return separateArray({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema,
      });
    else if (ChatGptTypeChecker.isReference(props.schema))
      return separateReference({
        predicate: props.predicate,
        convention: props.convention,
        $defs: props.$defs,
        schema: props.schema,
      });
    return [props.schema, null];
  };

  const separateArray = (props: {
    predicate: (schema: IChatGptSchema) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, IChatGptSchema>;
    schema: IChatGptSchema.IArray;
  }): [IChatGptSchema.IArray | null, IChatGptSchema.IArray | null] => {
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
    $defs: Record<string, IChatGptSchema>;
    predicate: (schema: IChatGptSchema) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    schema: IChatGptSchema.IObject;
  }): [IChatGptSchema.IObject | null, IChatGptSchema.IObject | null] => {
    // EMPTY OBJECT
    if (
      Object.keys(props.schema.properties ?? {}).length === 0 &&
      !!props.schema.additionalProperties === false
    )
      return [props.schema, null];

    const llm = {
      ...props.schema,
      properties: {} as Record<string, IChatGptSchema>,
      additionalProperties: props.schema.additionalProperties,
    } satisfies IChatGptSchema.IObject;
    const human = {
      ...props.schema,
      properties: {} as Record<string, IChatGptSchema>,
    } satisfies IChatGptSchema.IObject;

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
    predicate: (schema: IChatGptSchema) => boolean;
    convention: (key: string, type: "llm" | "human") => string;
    $defs: Record<string, IChatGptSchema>;
    schema: IChatGptSchema.IReference;
  }): [IChatGptSchema.IReference | null, IChatGptSchema.IReference | null] => {
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
    const schema: IChatGptSchema = props.$defs?.[key]!;
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
    s: IChatGptSchema.IObject,
  ): IChatGptSchema.IObject => {
    s.required = s.required.filter((key) => s.properties?.[key] !== undefined);
    return s;
  };

  /* -----------------------------------------------------------
    INVERTERS
  ----------------------------------------------------------- */
  export const invert = (props: {
    components: OpenApi.IComponents;
    schema: IChatGptSchema;
    $defs: Record<string, IChatGptSchema>;
  }): OpenApi.IJsonSchema => {
    const union: OpenApi.IJsonSchema[] = [];
    const attribute: OpenApi.IJsonSchema.__IAttribute = {
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

    const next = (schema: IChatGptSchema): OpenApi.IJsonSchema =>
      invert({
        components: props.components,
        $defs: props.$defs,
        schema,
      });
    const visit = (schema: IChatGptSchema): void => {
      if (ChatGptTypeChecker.isArray(schema))
        union.push({
          ...LlmDescriptionInverter.array(schema.description ?? ""),
          ...schema,
          items: next(schema.items),
        });
      else if (ChatGptTypeChecker.isObject(schema))
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
      else if (ChatGptTypeChecker.isAnyOf(schema)) schema.anyOf.forEach(visit);
      else if (ChatGptTypeChecker.isReference(schema)) {
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
      } else if (ChatGptTypeChecker.isBoolean(schema))
        if (!!schema.enum?.length)
          schema.enum.forEach((v) =>
            union.push({
              const: v,
            }),
          );
        else union.push(schema);
      else if (
        ChatGptTypeChecker.isInteger(schema) ||
        ChatGptTypeChecker.isNumber(schema)
      )
        if (!!schema.enum?.length)
          schema.enum.forEach((v) =>
            union.push({
              const: v,
            }),
          );
        else
          union.push({
            ...LlmDescriptionInverter.numeric(schema.description ?? ""),
            ...schema,
            ...{ enum: undefined },
          });
      else if (ChatGptTypeChecker.isString(schema))
        if (!!schema.enum?.length)
          schema.enum.forEach((v) =>
            union.push({
              const: v,
            }),
          );
        else
          union.push({
            ...LlmDescriptionInverter.string(schema.description ?? ""),
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
      ...(union.length === 0
        ? { type: undefined }
        : union.length === 1
          ? { ...union[0] }
          : { oneOf: union.map((u) => ({ ...u, nullable: undefined })) }),
      ...attribute,
    };
  };
}
