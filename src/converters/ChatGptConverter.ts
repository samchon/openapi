import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { ILlmApplication } from "../structures/ILlmApplication";
import { ChatGptTypeChecker } from "../utils/ChatGptTypeChecker";
import { OpenApiContraintShifter } from "../utils/OpenApiContraintShifter";
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
    const union: Array<IChatGptSchema | null> = [];
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
              ...input,
              $ref: `#/$defs/${key}`,
              title: undefined,
              description: undefined,
            });
          if (props.$defs[key] !== undefined) return out();
          props.$defs[key] = {};
          const converted: IChatGptSchema | null = schema({
            options: props.options,
            components: props.components,
            $defs: props.$defs,
            schema: target,
          });
          if (converted === null) return union.push(null);
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
          return union.push(null);
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
        if (additionalProperties === null) return union.push(null);
        return union.push({
          ...input,
          properties: properties as Record<string, IChatGptSchema>,
          additionalProperties,
          required: Object.keys(properties),
        });
      } else if (OpenApiTypeChecker.isArray(input)) {
        const items: IChatGptSchema | null = schema({
          options: props.options,
          components: props.components,
          $defs: props.$defs,
          schema: input.items,
        });
        if (items === null) return union.push(null);
        return union.push(
          (props.options.constraint
            ? (x: IChatGptSchema.IArray) => x
            : (x: IChatGptSchema.IArray) =>
                OpenApiContraintShifter.shiftArray(x))({
            ...input,
            items,
          }),
        );
      } else if (OpenApiTypeChecker.isString(input))
        return union.push(
          (props.options.constraint
            ? (x: IChatGptSchema.IString) => x
            : (x: IChatGptSchema.IString) =>
                OpenApiContraintShifter.shiftString(x))({
            ...input,
          }),
        );
      else if (
        OpenApiTypeChecker.isNumber(input) ||
        OpenApiTypeChecker.isInteger(input)
      )
        return union.push(
          (props.options.constraint
            ? (x: IChatGptSchema.INumber | IChatGptSchema.IInteger) => x
            : (x: IChatGptSchema.INumber | IChatGptSchema.IInteger) =>
                OpenApiContraintShifter.shiftNumeric(x))({
            ...input,
          }),
        );
      else if (OpenApiTypeChecker.isConstant(input)) return 0;
      else if (OpenApiTypeChecker.isTuple(input)) return union.push(null);
      else return union.push({ ...input });
    };
    const visitConstant = (input: OpenApi.IJsonSchema): void => {
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
        ...union[0]!,
        description: ChatGptTypeChecker.isReference(union[0]!)
          ? undefined
          : union[0]!.description,
      };
    return {
      ...attribute,
      anyOf: union.map((u) => ({
        ...u!,
        description: ChatGptTypeChecker.isReference(u!)
          ? undefined
          : u!.description,
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
}
