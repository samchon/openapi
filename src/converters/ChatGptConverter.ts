import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { ChatGptTypeChecker } from "../utils/ChatGptTypeChecker";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";

export namespace ChatGptConverter {
  export const parameters = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
  }): IChatGptSchema.ITopObject | null => {
    const $defs: Record<string, IChatGptSchema> = {};
    const res: IChatGptSchema.ITopObject | null = schema({
      components: props.components,
      schema: props.schema,
      $defs,
    }) as IChatGptSchema.ITopObject | null;
    if (res === null) return null;
    else if (Object.keys($defs).length) res.$defs = $defs;
    return res;
  };

  export const schema = (props: {
    components: OpenApi.IComponents;
    $defs: Record<string, IChatGptSchema>;
    schema: OpenApi.IJsonSchema;
  }): IChatGptSchema | null => {
    if (OpenApiTypeChecker.isReference(props.schema)) {
      const key: string = props.schema.$ref.split("#/components/schemas/")[1];
      const target: OpenApi.IJsonSchema | undefined =
        props.components.schemas?.[key];
      if (target === undefined) return null;

      const out = () => ({
        ...props.schema,
        $ref: `#/$defs/${key}`,
      });
      if (props.$defs[key] !== undefined) return out();
      props.$defs[key] = {};
      const converted: IChatGptSchema | null = schema({
        components: props.components,
        $defs: props.$defs,
        schema: target,
      });
      if (converted === null) return null;

      props.$defs[key] = converted;
      return out();
    } else if (OpenApiTypeChecker.isArray(props.schema)) {
      const items: IChatGptSchema | null = schema({
        components: props.components,
        $defs: props.$defs,
        schema: props.schema.items,
      });
      if (items === null) return null;
      return {
        ...props.schema,
        items,
      };
    } else if (OpenApiTypeChecker.isTuple(props.schema)) {
      const prefixItems: Array<IChatGptSchema | null> =
        props.schema.prefixItems.map((item) =>
          schema({
            components: props.components,
            $defs: props.$defs,
            schema: item,
          }),
        );
      if (prefixItems.some((v) => v === null)) return null;
      const additionalItems =
        props.schema.additionalItems === undefined
          ? false
          : typeof props.schema.additionalItems === "object" &&
              props.schema.additionalItems !== null
            ? schema({
                components: props.components,
                $defs: props.$defs,
                schema: props.schema.additionalItems,
              })
            : props.schema.additionalItems;
      if (additionalItems === null) return null;
      return {
        ...props.schema,
        prefixItems: prefixItems.filter((v) => v !== null),
        additionalItems,
      };
    } else if (OpenApiTypeChecker.isObject(props.schema)) {
      const properties: Record<string, IChatGptSchema | null> = Object.entries(
        props.schema.properties || {},
      ).reduce(
        (acc, [key, value]) => {
          const converted: IChatGptSchema | null = schema({
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
      if (Object.values(properties).some((v) => v === null)) return null;
      const additionalProperties =
        props.schema.additionalProperties === undefined
          ? false
          : typeof props.schema.additionalProperties === "object" &&
              props.schema.additionalProperties !== null
            ? schema({
                components: props.components,
                $defs: props.$defs,
                schema: props.schema.additionalProperties,
              })
            : props.schema.additionalProperties;
      if (additionalProperties === null) return null;
      return {
        ...props.schema,
        properties: properties as Record<string, IChatGptSchema>,
        additionalProperties,
      };
    } else if (OpenApiTypeChecker.isOneOf(props.schema)) {
      const oneOf: Array<IChatGptSchema | null> = props.schema.oneOf.map(
        (item) =>
          schema({
            components: props.components,
            $defs: props.$defs,
            schema: item,
          }),
      );
      if (oneOf.some((v) => v === null)) return null;
      return {
        ...props.schema,
        oneOf: oneOf.filter((v) => v !== null),
        discriminator: props.schema.discriminator
          ? {
              propertyName: props.schema.discriminator.propertyName,
              mapping: props.schema.discriminator.mapping
                ? Object.fromEntries(
                    Object.entries(props.schema.discriminator.mapping).map(
                      ([key, value]) => [
                        key,
                        value.replace("#/components/schemas/", "#/$defs/"),
                      ],
                    ),
                  )
                : undefined,
            }
          : undefined,
      };
    }
    return props.schema;
  };

  export const separate = (props: {
    $defs: Record<string, IChatGptSchema>;
    predicate: (schema: IChatGptSchema) => boolean;
    schema: IChatGptSchema;
  }): [IChatGptSchema | null, IChatGptSchema | null] => {
    if (props.predicate(props.schema) === true) return [null, props.schema];
    else if (
      ChatGptTypeChecker.isUnknown(props.schema) ||
      ChatGptTypeChecker.isOneOf(props.schema)
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
