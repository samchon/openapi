import { OpenApi } from "../../OpenApi";
import { IChatGptSchema } from "../../structures/IChatGptSchema";
import { ILlmFunction } from "../../structures/ILlmFunction";
import { ILlmSchemaV3_1 } from "../../structures/ILlmSchemaV3_1";
import { IOpenApiSchemaError } from "../../structures/IOpenApiSchemaError";
import { IResult } from "../../typings/IResult";
import { ChatGptTypeChecker } from "../../utils/ChatGptTypeChecker";
import { LlmTypeCheckerV3_1 } from "../../utils/LlmTypeCheckerV3_1";
import { OpenApiTypeChecker } from "../../utils/OpenApiTypeChecker";
import { LlmSchemaV3_1Composer } from "./LlmSchemaV3_1Composer";

export namespace ChatGptSchemaComposer {
  /**
   * @internal
   */
  export const IS_DEFS = true;

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
      result.value.$defs[key] = transform(result.value.$defs[key]);
    return {
      success: true,
      value: transform(result.value) as IChatGptSchema.IParameters,
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
        props.$defs[key] = transform(props.$defs[key]);
    return {
      success: true,
      value: transform(result.value),
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

  const transform = (schema: ILlmSchemaV3_1): IChatGptSchema => {
    const union: Array<IChatGptSchema> = [];
    const attribute: IChatGptSchema.__IAttribute = {
      title: schema.title,
      description: schema.description,
      example: schema.example,
      examples: schema.examples,
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
          items: transform(input.items),
        });
      else if (LlmTypeCheckerV3_1.isObject(input))
        union.push({
          ...input,
          properties: Object.fromEntries(
            Object.entries(input.properties).map(([key, value]) => [
              key,
              transform(value),
            ]),
          ),
          additionalProperties:
            typeof input.additionalProperties === "object" &&
            input.additionalProperties !== null
              ? transform(input.additionalProperties)
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
        input.oneOf.forEach(visitConstant);
    };
    visit(schema);
    visitConstant(schema);
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
          : union[0].description,
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

  export const separateParameters = (props: {
    predicate: (schema: IChatGptSchema) => boolean;
    parameters: IChatGptSchema.IParameters;
  }): ILlmFunction.ISeparated<"chatgpt"> => {
    const [llm, human] = separateObject({
      $defs: props.parameters.$defs,
      predicate: props.predicate,
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
    return output;
  };

  const separateStation = (props: {
    $defs: Record<string, IChatGptSchema>;
    predicate: (schema: IChatGptSchema) => boolean;
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
        $defs: props.$defs,
        predicate: props.predicate,
        schema: props.schema,
      });
    else if (ChatGptTypeChecker.isArray(props.schema))
      return separateArray({
        $defs: props.$defs,
        predicate: props.predicate,
        schema: props.schema,
      });
    else if (ChatGptTypeChecker.isReference(props.schema))
      return separateReference({
        $defs: props.$defs,
        predicate: props.predicate,
        schema: props.schema,
      });
    return [props.schema, null];
  };

  const separateArray = (props: {
    $defs: Record<string, IChatGptSchema>;
    predicate: (schema: IChatGptSchema) => boolean;
    schema: IChatGptSchema.IArray;
  }): [IChatGptSchema.IArray | null, IChatGptSchema.IArray | null] => {
    const [x, y] = separateStation({
      $defs: props.$defs,
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
    $defs: Record<string, IChatGptSchema>;
    predicate: (schema: IChatGptSchema) => boolean;
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
        $defs: props.$defs,
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
        $defs: props.$defs,
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
      !!Object.keys(human.properties).length || human.additionalProperties
        ? shrinkRequired(human)
        : null,
    ];
  };

  const separateReference = (props: {
    $defs: Record<string, IChatGptSchema>;
    predicate: (schema: IChatGptSchema) => boolean;
    schema: IChatGptSchema.IReference;
  }): [IChatGptSchema.IReference | null, IChatGptSchema.IReference | null] => {
    const key: string = props.schema.$ref.split("#/$defs/")[1];

    // FIND EXISTING
    if (props.$defs?.[`${key}.Human`] || props.$defs?.[`${key}.Llm`])
      return [
        props.$defs?.[`${key}.Llm`]
          ? {
              ...props.schema,
              $ref: `#/$defs/${key}.Llm`,
            }
          : null,
        props.$defs?.[`${key}.Human`]
          ? {
              ...props.schema,
              $ref: `#/$defs/${key}.Human`,
            }
          : null,
      ];

    // PRE-ASSIGNMENT
    props.$defs![`${key}.Llm`] = {};
    props.$defs![`${key}.Human`] = {};

    // DO COMPOSE
    const schema: IChatGptSchema = props.$defs?.[key]!;
    const [llm, human] = separateStation({
      $defs: props.$defs,
      predicate: props.predicate,
      schema,
    });

    // ONLY ONE
    if (llm === null || human === null) {
      delete props.$defs[`${key}.Llm`];
      delete props.$defs[`${key}.Human`];
      return llm === null ? [null, props.schema] : [props.schema, null];
    }

    // BOTH OF THEM
    return [
      llm !== null
        ? {
            ...props.schema,
            $ref: `#/$defs/${key}.Llm`,
          }
        : null,
      human !== null
        ? {
            ...props.schema,
            $ref: `#/$defs/${key}.Human`,
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
}
