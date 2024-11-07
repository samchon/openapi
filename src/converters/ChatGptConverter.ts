import { OpenApi } from "../OpenApi";
import { IChatGptSchema } from "../structures/IChatGptSchema";
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
}
