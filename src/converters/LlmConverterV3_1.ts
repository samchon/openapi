import { OpenApi } from "../OpenApi";
import { ILlmSchemaV3_1 } from "../structures/ILlmSchemaV3_1";
import { LlmTypeCheckerV3_1 } from "../utils/LlmTypeCheckerV3_1";
import { OpenApiContraintShifter } from "../utils/OpenApiContraintShifter";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";
import { JsonDescriptionUtil } from "../utils/internal/JsonDescriptionUtil";

export namespace LlmConverterV3_1 {
  export const parameters = (props: {
    config: ILlmSchemaV3_1.IConfig;
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference;
  }): ILlmSchemaV3_1.IParameters | null => {
    const $defs: Record<string, ILlmSchemaV3_1> = {};
    const entity: OpenApi.IJsonSchema | null =
      OpenApiTypeChecker.unreference(props);
    if (entity === null || OpenApiTypeChecker.isObject(entity) === false)
      return null;
    const res: ILlmSchemaV3_1.IParameters | null = schema({
      config: props.config,
      components: props.components,
      schema: entity,
      $defs,
    }) as ILlmSchemaV3_1.IParameters | null;
    if (res === null) return null;
    res.$defs = $defs;
    return res;
  };

  export const schema = (props: {
    config: ILlmSchemaV3_1.IConfig;
    components: OpenApi.IComponents;
    $defs: Record<string, ILlmSchemaV3_1>;
    schema: OpenApi.IJsonSchema;
  }): ILlmSchemaV3_1 | null => {
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
              title: undefined,
              description: undefined,
            });
          if (props.$defs[key] !== undefined) return out();
          props.$defs[key] = {};
          const converted: ILlmSchemaV3_1 | null = schema({
            config: props.config,
            components: props.components,
            $defs: props.$defs,
            schema: target,
          });
          if (converted === null) return union.push(null);
          converted.description = JsonDescriptionUtil.cascade({
            prefix: "#/components/schemas/",
            components: props.components,
            $ref: input.$ref,
            description: converted.description,
            escape: false,
          });
          props.$defs[key] = converted;
          return out();
        } else {
          const length: number = union.length;
          visit(target);
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
        const properties: Record<string, ILlmSchemaV3_1 | null> =
          Object.entries(input.properties ?? {}).reduce(
            (acc, [key, value]) => {
              const converted: ILlmSchemaV3_1 | null = schema({
                config: props.config,
                components: props.components,
                $defs: props.$defs,
                schema: value,
              });
              if (converted === null) return acc;
              acc[key] = converted;
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
          | undefined =
          typeof input.additionalProperties === "object" &&
          input.additionalProperties !== null
            ? schema({
                config: props.config,
                components: props.components,
                $defs: props.$defs,
                schema: input.additionalProperties,
              })
            : input.additionalProperties;
        if (additionalProperties === null) return union.push(null);
        return union.push({
          ...input,
          properties: properties as Record<string, ILlmSchemaV3_1>,
          additionalProperties,
          required: Object.keys(properties),
        });
      } else if (OpenApiTypeChecker.isArray(input)) {
        const items: ILlmSchemaV3_1 | null = schema({
          config: props.config,
          components: props.components,
          $defs: props.$defs,
          schema: input.items,
        });
        if (items === null) return union.push(null);
        return union.push(
          (props.config.constraint
            ? (x: ILlmSchemaV3_1.IArray) => x
            : (x: ILlmSchemaV3_1.IArray) =>
                OpenApiContraintShifter.shiftArray(x))({
            ...input,
            items,
          }),
        );
      } else if (OpenApiTypeChecker.isString(input))
        return union.push(
          (props.config.constraint
            ? (x: ILlmSchemaV3_1.IString) => x
            : (x: ILlmSchemaV3_1.IString) =>
                OpenApiContraintShifter.shiftString(x))({
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
                OpenApiContraintShifter.shiftNumeric(x))({
            ...input,
          }),
        );
      else if (OpenApiTypeChecker.isTuple(input)) return union.push(null);
      else return union.push({ ...input });
    };
    visit(props.schema);

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
        description: LlmTypeCheckerV3_1.isReference(union[0]!)
          ? undefined
          : union[0]!.description,
      };
    return {
      ...attribute,
      oneOf: union.map((u) => ({
        ...u!,
        description: LlmTypeCheckerV3_1.isReference(u!)
          ? undefined
          : u!.description,
      })),
    };
  };

  export const separate = (props: {
    predicate: (schema: ILlmSchemaV3_1) => boolean;
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
        schema: props.schema,
      });
    else if (LlmTypeCheckerV3_1.isArray(props.schema))
      return separateArray({
        predicate: props.predicate,
        schema: props.schema,
      });
    return [props.schema, null];
  };

  const separateArray = (props: {
    predicate: (schema: ILlmSchemaV3_1) => boolean;
    schema: ILlmSchemaV3_1.IArray;
  }): [ILlmSchemaV3_1.IArray | null, ILlmSchemaV3_1.IArray | null] => {
    const [x, y] = separate({
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
    predicate: (schema: ILlmSchemaV3_1) => boolean;
    schema: ILlmSchemaV3_1.IObject;
  }): [ILlmSchemaV3_1.IObject | null, ILlmSchemaV3_1.IObject | null] => {
    const llm = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3_1>,
    } satisfies ILlmSchemaV3_1.IObject;
    const human = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3_1>,
    } satisfies ILlmSchemaV3_1.IObject;
    for (const [key, value] of Object.entries(props.schema.properties ?? {})) {
      const [x, y] = separate({
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

  const shrinkRequired = (
    s: ILlmSchemaV3_1.IObject,
  ): ILlmSchemaV3_1.IObject => {
    if (s.required !== undefined)
      s.required = s.required.filter(
        (key) => s.properties?.[key] !== undefined,
      );
    return s;
  };
}
