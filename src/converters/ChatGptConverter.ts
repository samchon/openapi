import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
import { ChatGptTypeChecker } from "../utils/ChatGptTypeChecker";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";

export namespace ChatGptConverter {
  export const schema = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
  }): IChatGptSchema.ITop | null => {
    const $defs: Record<string, IChatGptSchema> = {};
    const schema: IChatGptSchema.ITop | null = convertSchema({
      components: props.components,
      schema: props.schema,
      $defs,
    });
    if (schema === null) return null;
    else if (Object.keys($defs).length) schema.$defs = $defs;
    return schema;
  };

  const convertSchema = (props: {
    components: OpenApi.IComponents;
    $defs: Record<string, IChatGptSchema>;
    schema: OpenApi.IJsonSchema;
  }): IChatGptSchema | null => {
    if (OpenApiTypeChecker.isReference(props.schema)) {
      const key: string = props.schema.$ref.split("#/components/schemas/")[1];
      const target: OpenApi.IJsonSchema | undefined =
        props.components.schemas?.[key];
      if (target === undefined) return null;

      props.$defs[key] = {};
      const converted: IChatGptSchema | null = convertSchema({
        components: props.components,
        $defs: props.$defs,
        schema: target,
      });
      if (converted === null) return null;

      props.$defs[key] = converted;
      return {
        ...props.schema,
        $ref: `#/$defs/${key}`,
      };
    } else if (OpenApiTypeChecker.isArray(props.schema)) {
      const items: IChatGptSchema | null = convertSchema({
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
          convertSchema({
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
            ? convertSchema({
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
          const converted: IChatGptSchema | null = convertSchema({
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
            ? convertSchema({
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
          convertSchema({
            components: props.components,
            $defs: props.$defs,
            schema: item,
          }),
      );
      if (oneOf.some((v) => v === null)) return null;
      return {
        ...props.schema,
        oneOf: oneOf.filter((v) => v !== null),
      };
    }
    return props.schema;
  };

  export const separate = (props: {
    top: IChatGptSchema.ITop;
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
        top: props.top,
        predicate: props.predicate,
        schema: props.schema,
      });
    else if (ChatGptTypeChecker.isArray(props.schema))
      return separateArray({
        top: props.top,
        predicate: props.predicate,
        schema: props.schema,
      });
    else if (ChatGptTypeChecker.isReference(props.schema))
      return separateReference({
        top: props.top,
        predicate: props.predicate,
        schema: props.schema,
      });
    return [props.schema, null];
  };

  const separateArray = (props: {
    top: IChatGptSchema.ITop;
    predicate: (schema: IChatGptSchema) => boolean;
    schema: IChatGptSchema.IArray;
  }): [IChatGptSchema.IArray | null, IChatGptSchema.IArray | null] => {
    const [x, y] = separate({
      top: props.top,
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
    top: IChatGptSchema.ITop;
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
        top: props.top,
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
        top: props.top,
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
    top: IChatGptSchema.ITop;
    predicate: (schema: IChatGptSchema) => boolean;
    schema: IChatGptSchema.IReference;
  }): [IChatGptSchema.IReference | null, IChatGptSchema.IReference | null] => {
    const key: string = props.schema.$ref.split("#/$defs/")[1];

    // FIND EXISTING
    if (props.top.$defs?.[`${key}.Human`] || props.top.$defs?.[`${key}.Llm`])
      return [
        props.top.$defs?.[`${key}.Llm`]
          ? {
              ...props.schema,
              $ref: `#/$defs/${key}.Llm`,
            }
          : null,
        props.top.$defs?.[`${key}.Human`]
          ? {
              ...props.schema,
              $ref: `#/$defs/${key}.Human`,
            }
          : null,
      ];

    // PRE-ASSIGNMENT
    props.top.$defs![`${key}.Llm`] = {};
    props.top.$defs![`${key}.Human`] = {};

    // DO COMPOSE
    const schema: IChatGptSchema = props.top.$defs?.[key]!;
    const [llm, human] = separate({
      top: props.top,
      predicate: props.predicate,
      schema,
    });
    if (llm === null) delete props.top.$defs![`${key}.Llm`];
    else props.top.$defs![`${key}.Llm`] = llm;
    if (human === null) delete props.top.$defs![`${key}.Human`];
    else props.top.$defs![`${key}.Human`] = human;

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
