import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { ChatGptTypeChecker } from "../utils/ChatGptTypeChecker";
import { LlmTypeCheckerV3_1 } from "../utils/LlmTypeCheckerV3_1";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";
import { LlmConverterV3_1 } from "./LlmConverterV3_1";

export namespace ChatGptConverter {
  export const parameters = (props: {
    config: IChatGptSchema.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
  }): IChatGptSchema.IParameters | null => {
    const params: ILlmSchemaV3_1.IParameters | null =
      LlmConverterV3_1.parameters({
        config: {
          reference: props.config.reference,
          constraint: false,
        },
        components: props.components,
        schema: props.schema,
      });
    if (params === null) return null;
    for (const key of Object.keys(params.$defs))
      params.$defs[key] = transform(params.$defs[key]);
    for (const key of Object.keys(params.properties))
      params.properties[key] = transform(params.properties[key]);
    return params;
  };

  export const schema = (props: {
    config: IChatGptSchema.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, IChatGptSchema>;
    schema: OpenApi.IJsonSchema;
  }): IChatGptSchema | null => {
    const oldbie: Set<string> = new Set(Object.keys(props.$defs));
    const schema: ILlmSchemaV3_1 | null = LlmConverterV3_1.schema({
      config: {
        reference: props.config.reference,
        constraint: false,
      },
      components: props.components,
      $defs: props.$defs,
      schema: props.schema,
    });
    if (schema === null) return null;
    for (const key of Object.keys(props.$defs))
      if (oldbie.has(key) === false)
        props.$defs[key] = transform(props.$defs[key]);
    return transform(schema);
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

  export const separate = (props: {
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
    const [x, y] = separate({
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
    const llm = {
      ...props.schema,
      properties: {} as Record<string, IChatGptSchema>,
    } satisfies IChatGptSchema.IObject;
    const human = {
      ...props.schema,
      properties: {} as Record<string, IChatGptSchema>,
    } satisfies IChatGptSchema.IObject;
    for (const [key, value] of Object.entries(props.schema.properties ?? {})) {
      const [x, y] = separate({
        $defs: props.$defs,
        predicate: props.predicate,
        schema: value,
      });
      if (x !== null) llm.properties[key] = x;
      if (y !== null) human.properties[key] = y;
    }
    llm.additionalProperties = false;
    human.additionalProperties = false;
    return [
      Object.keys(llm.properties).length === 0 ? null : shrinkRequired(llm),
      Object.keys(human.properties).length === 0 ? null : shrinkRequired(human),
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
    const [llm, human] = separate({
      $defs: props.$defs,
      predicate: props.predicate,
      schema,
    });
    if (llm === null) delete props.$defs![`${key}.Llm`];
    else props.$defs![`${key}.Llm`] = llm;
    if (human === null) delete props.$defs![`${key}.Human`];
    else props.$defs![`${key}.Human`] = human;

    // FINALIZE
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
