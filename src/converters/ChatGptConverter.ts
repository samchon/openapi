import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { ILlmApplication } from "../structures/ILlmApplication";
import { ChatGptTypeChecker } from "../utils/ChatGptTypeChecker";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";

export namespace ChatGptConverter {
  export const parameters = (props: {
    options: Omit<ILlmApplication.IChatGptOptions, "separate">;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
  }): IChatGptSchema.IParameters | null => {
    const $defs: Record<string, IChatGptSchema> = {};
    const res: IChatGptSchema.IParameters | null = schema({
      options: props.options,
      components: props.components,
      schema: props.schema,
      $defs,
    }) as IChatGptSchema.IParameters | null;
    if (res === null) return null;
    else if (Object.keys($defs).length) res.$defs = $defs;
    return res;
  };

  export const schema = (props: {
    options: Omit<ILlmApplication.IChatGptOptions, "separate">;
    components: OpenApi.IComponents;
    $defs: Record<string, IChatGptSchema>;
    schema: OpenApi.IJsonSchema;
  }): IChatGptSchema | null => {
    const union: Array<IUnionElement> = [];
    const attribute: IChatGptSchema.__IAttribute = {
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
    const visit = (input: OpenApi.IJsonSchema): number => {
      if (OpenApiTypeChecker.isOneOf(input)) {
        input.oneOf.forEach(visit);
        return 0;
      } else if (OpenApiTypeChecker.isReference(input)) {
        const key: string = input.$ref.split("#/components/schemas/")[1];
        const target: OpenApi.IJsonSchema | undefined =
          props.components.schemas?.[key];
        if (target === undefined) return 0;
        if (
          props.options.reference === true ||
          OpenApiTypeChecker.isRecursiveReference({
            components: props.components,
            schema: input,
          })
        ) {
          const out = () =>
            union.push({
              schema: {
                ...input,
                $ref: `#/$defs/${key}`,
                title: undefined,
                description: undefined,
              },
              tags: [],
            });
          if (props.$defs[key] !== undefined) return out();
          props.$defs[key] = {};
          const converted: IChatGptSchema | null = schema({
            options: props.options,
            components: props.components,
            $defs: props.$defs,
            schema: target,
          });
          if (converted === null)
            return union.push({
              schema: null,
              tags: [],
            });
          props.$defs[key] = converted;
          return out();
        } else return visit(target);
      } else if (OpenApiTypeChecker.isObject(input)) {
        const properties: Record<string, IChatGptSchema | null> =
          Object.entries(input.properties || {}).reduce(
            (acc, [key, value]) => {
              const converted: IChatGptSchema | null = schema({
                options: props.options,
                components: props.components,
                $defs: props.$defs,
                schema: value,
              });
              if (converted === null) return acc;
              acc[key] = converted;
              return acc;
            },
            {} as Record<string, IChatGptSchema | null>,
          );
        if (Object.values(properties).some((v) => v === null))
          return union.push({
            schema: null,
            tags: [],
          });
        const additionalProperties =
          input.additionalProperties === undefined
            ? false
            : typeof input.additionalProperties === "object" &&
                input.additionalProperties !== null
              ? schema({
                  options: props.options,
                  components: props.components,
                  $defs: props.$defs,
                  schema: input.additionalProperties,
                })
              : input.additionalProperties;
        if (additionalProperties === null)
          return union.push({
            schema: null,
            tags: [],
          });
        return union.push({
          schema: {
            ...input,
            properties: properties as Record<string, IChatGptSchema>,
            additionalProperties,
            required: Object.keys(properties),
          },
          tags: [],
        });
      } else if (OpenApiTypeChecker.isArray(input)) {
        const items: IChatGptSchema | null = schema({
          options: props.options,
          components: props.components,
          $defs: props.$defs,
          schema: input.items,
        });
        if (items === null)
          return union.push({
            schema: null,
            tags: props.options.constraint ? [] : getArrayTags(input),
          });
        return union.push({
          schema: {
            ...input,
            items,
            ...(props.options.constraint
              ? {}
              : {
                  maxItems: undefined,
                  minItems: undefined,
                  uniqueItems: undefined,
                }),
          },
          tags: props.options.constraint ? [] : getArrayTags(input),
        });
      } else if (OpenApiTypeChecker.isString(input))
        return union.push({
          schema: {
            ...input,
            ...(props.options.constraint
              ? {}
              : {
                  contentMediaType: undefined,
                  minLength: undefined,
                  maxLength: undefined,
                  format: undefined,
                  pattern: undefined,
                }),
          },
          tags: props.options.constraint ? [] : getStringTags(input),
        });
      else if (
        OpenApiTypeChecker.isNumber(input) ||
        OpenApiTypeChecker.isInteger(input)
      )
        return union.push({
          schema: {
            ...input,
            ...(props.options.constraint
              ? {}
              : {
                  maximum: undefined,
                  minimum: undefined,
                  exclusiveMaximum: undefined,
                  exclusiveMinimum: undefined,
                  multipleOf: undefined,
                }),
          },
          tags: props.options.constraint ? [] : getNumericTags(input),
        });
      else if (OpenApiTypeChecker.isConstant(input)) return 0;
      else if (OpenApiTypeChecker.isTuple(input))
        return union.push({
          schema: null,
          tags: [],
        });
      else
        return union.push({
          schema: { ...input },
          tags: [],
        });
    };
    const visitConstant = (input: OpenApi.IJsonSchema): void => {
      const insert = (value: any): void => {
        const matched: IUnionElement<IChatGptSchema.IString> | undefined =
          union.find(
            (u) =>
              (u.schema as IChatGptSchema.__ISignificant<any>)?.type ===
              typeof value,
          ) as IUnionElement<IChatGptSchema.IString> | undefined;
        if (matched !== undefined) {
          matched.schema!.enum ??= [];
          matched.schema!.enum.push(value);
        } else
          union.push({
            schema: {
              type: typeof value as "number",
              enum: [value],
            },
            tags: [],
          });
      };
      if (OpenApiTypeChecker.isConstant(input)) insert(input.const);
      else if (OpenApiTypeChecker.isOneOf(input))
        input.oneOf.forEach(visitConstant);
      else if (
        props.options.reference === false &&
        OpenApiTypeChecker.isReference(input) &&
        OpenApiTypeChecker.isRecursiveReference({
          components: props.components,
          schema: input,
        }) === false
      ) {
        const target: OpenApi.IJsonSchema | undefined =
          props.components.schemas?.[
            input.$ref.split("#/components/schemas/")[1]
          ];
        if (target !== undefined) visitConstant(target);
      }
    };
    visit(props.schema);
    visitConstant(props.schema);

    if (union.some((u) => u === null)) return null;
    else if (union.length === 0)
      return {
        ...attribute,
        type: undefined,
      };
    else if (union.length === 1)
      return {
        ...attribute,
        ...union[0].schema,
        description: ChatGptTypeChecker.isReference(union[0].schema!)
          ? undefined
          : writeTagWithDescription({
              description: attribute.description,
              tags: union[0].tags,
            }),
      };
    return {
      ...attribute,
      anyOf: union.map((u) => ({
        ...u.schema,
        description: ChatGptTypeChecker.isReference(u.schema!)
          ? undefined
          : writeTagWithDescription({
              description: u.schema?.description,
              tags: u.tags,
            }),
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
    if (
      typeof props.schema.additionalProperties === "object" &&
      props.schema.additionalProperties !== null
    ) {
      const [x, y] = separate({
        $defs: props.$defs,
        predicate: props.predicate,
        schema: props.schema.additionalProperties,
      });
      if (x !== null) llm.additionalProperties = x;
      if (y !== null) human.additionalProperties = y;
    } else {
      llm.additionalProperties = false;
      human.additionalProperties = false;
    }
    return [
      Object.keys(llm.properties).length === 0 &&
      llm.additionalProperties === false
        ? null
        : shrinkRequired(llm),
      Object.keys(human.properties).length === 0 &&
      human.additionalProperties === false
        ? null
        : shrinkRequired(human),
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
    if (s.required !== undefined)
      s.required = s.required.filter(
        (key) => s.properties?.[key] !== undefined,
      );
    return s;
  };

  const getNumericTags = (
    schema: OpenApi.IJsonSchema.IInteger | OpenApi.IJsonSchema.INumber,
  ) => [
    ...(schema.minimum !== undefined
      ? schema.exclusiveMinimum === true
        ? [`@exclusiveMinimum ${schema.minimum}`]
        : [`@minimum ${schema.minimum}`]
      : []),
    ...(schema.maximum !== undefined
      ? schema.exclusiveMaximum === true
        ? [`@exclusiveMaximum ${schema.maximum}`]
        : [`@maximum ${schema.maximum}`]
      : []),
    ...(schema.multipleOf !== undefined
      ? [`@multipleOf ${schema.multipleOf}`]
      : []),
  ];

  const getStringTags = (schema: OpenApi.IJsonSchema.IString) => [
    ...(schema.minLength !== undefined
      ? [`@minLength ${schema.minLength}`]
      : []),
    ...(schema.maxLength !== undefined
      ? [`@maxLength ${schema.maxLength}`]
      : []),
    ...(schema.format !== undefined ? [`@format ${schema.format}`] : []),
    ...(schema.pattern !== undefined ? [`@pattern ${schema.pattern}`] : []),
  ];

  const getArrayTags = (schema: OpenApi.IJsonSchema.IArray) => [
    ...(schema.minItems !== undefined ? [`@minItems ${schema.minItems}`] : []),
    ...(schema.maxItems !== undefined ? [`@maxItems ${schema.maxItems}`] : []),
  ];

  const writeTagWithDescription = (props: {
    description: string | undefined;
    tags: string[];
  }): string | undefined => {
    if (props.tags.length === 0) return props.description;
    return [
      ...(props.description?.length ? [props.description, "\n"] : []),
      ...props.tags,
    ].join("\n");
  };
}

interface IUnionElement<Schema extends IChatGptSchema = IChatGptSchema> {
  schema: Schema | null;
  tags: string[];
}
