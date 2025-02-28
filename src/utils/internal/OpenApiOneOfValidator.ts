import { OpenApi } from "../../OpenApi";
import { OpenApiTypeChecker } from "../OpenApiTypeChecker";
import { IOpenApiValidatorContext } from "./IOpenApiValidatorContext";
import { OpenApiStationValidator } from "./OpenApiStationValidator";

export namespace OpenApiOneOfValidator {
  export const validate = (
    ctx: IOpenApiValidatorContext<OpenApi.IJsonSchema.IOneOf>,
  ): boolean => {
    const discriminator: IDiscriminator = getDiscriminator(ctx);
    for (const item of discriminator.items) {
      if (item.predicator(ctx.value))
        return OpenApiStationValidator.validate({
          ...ctx,
          schema: item.schema,
        });
    }
    return (
      discriminator.remainders
        .map((schema) =>
          OpenApiStationValidator.validate({
            ...ctx,
            schema,
            exceptionable: false,
          }),
        )
        .some((v) => v) || ctx.report(ctx)
    );
  };

  const getDiscriminator = (
    ctx: IOpenApiValidatorContext<OpenApi.IJsonSchema.IOneOf>,
  ): IDiscriminator => {
    const resolvedList: IResolvedSchema[] = ctx.schema.oneOf.map((schema) =>
      getEscaped({
        components: ctx.components,
        schema,
        visited: new Set(),
      }),
    );

    // FIND ANY TYPE
    const anything: IResolvedSchema | undefined = resolvedList.find(
      (resolved) => OpenApiTypeChecker.isUnknown(resolved.escaped),
    );
    if (anything)
      return {
        items: [
          {
            schema: anything.schema,
            predicator: () => true,
          },
        ],
        remainders: [],
      };

    // CHECK NULLABLES
    const nullables: IResolvedSchema<OpenApi.IJsonSchema.INull>[] =
      resolvedList.filter(
        (resolved): resolved is IResolvedSchema<OpenApi.IJsonSchema.INull> =>
          OpenApiTypeChecker.isNull(resolved.schema),
      );
    const nonNullables: IResolvedSchema<OpenApi.IJsonSchema>[] =
      resolvedList.filter(
        (resolved) => false === OpenApiTypeChecker.isNull(resolved.escaped),
      );
    if (nonNullables.length === 1)
      return {
        items: [
          {
            schema: nonNullables[0].schema,
            predicator: (value) => value !== null,
          },
        ],
        remainders: nullables.map((nullable) => nullable.schema),
      };

    // CHECK ARRAYS
    const arrayItems: IDiscriminatorItem[] = [
      ...nonNullables
        .filter(
          (resolved): resolved is IResolvedSchema<OpenApi.IJsonSchema.IArray> =>
            OpenApiTypeChecker.isArray(resolved.escaped),
        )
        .filter((resolved, i, array) =>
          array.every(
            (item, j) =>
              i === j ||
              !OpenApiTypeChecker.covers({
                components: ctx.components,
                x: item.escaped.items,
                y: resolved.escaped.items,
              }),
          ),
        )
        .map(
          (resolved) =>
            ({
              schema: resolved.schema,
              predicator: (value) =>
                Array.isArray(value) &&
                (value.length === 0 ||
                  OpenApiStationValidator.validate({
                    ...ctx,
                    schema: (resolved.escaped as OpenApi.IJsonSchema.IArray)
                      .items,
                    value: value[0]!,
                    path: `${ctx.path}[0]`,
                    exceptionable: false,
                  })),
            }) satisfies IDiscriminatorItem,
        ),
    ];

    // CHECK OBJECTS
    const objects: IResolvedSchema<OpenApi.IJsonSchema.IObject>[] =
      nonNullables.filter(
        (resolved): resolved is IResolvedSchema<OpenApi.IJsonSchema.IObject> =>
          OpenApiTypeChecker.isObject(resolved.escaped),
      );
    const significants: IObjectSignificant[] = objects.map((resolved) => {
      const properties: Map<string, OpenApi.IJsonSchema> = new Map();
      const out = (): IObjectSignificant => ({
        schema: resolved.schema,
        escaped: resolved.escaped,
        properties,
      });
      if (
        resolved.escaped.properties === undefined ||
        !resolved.escaped.required?.length
      )
        return out();
      for (const [key, value] of Object.entries(resolved.escaped.properties)) {
        if (resolved.escaped.required.includes(key) === false) continue;
        properties.set(key, value);
      }
      return out();
    });
    const objectItems: IDiscriminatorItem[] = significants
      .map((x, i, array) => {
        for (const [key, schemaValue] of x.properties) {
          if (
            array.every(
              (y, j) =>
                i === j ||
                y.properties.has(key) === false ||
                !OpenApiTypeChecker.covers({
                  components: ctx.components,
                  x: y.properties.get(key)!,
                  y: schemaValue,
                }),
            )
          )
            return {
              schema: x.schema,
              predicator: (v) =>
                typeof v === "object" &&
                v !== null &&
                OpenApiStationValidator.validate({
                  ...ctx,
                  schema: schemaValue,
                  value: (v as any)[key],
                  exceptionable: false,
                }),
            } satisfies IDiscriminatorItem;
        }
        return null;
      })
      .filter((x) => x !== null);

    const items: IDiscriminatorItem[] = [...arrayItems, ...objectItems];
    return {
      items,
      remainders: ctx.schema.oneOf.filter(
        (schema) => items.some((item) => item.schema === schema) === false,
      ),
    };
  };

  const getEscaped = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    visited: Set<string>;
  }): IResolvedSchema => {
    if (OpenApiTypeChecker.isReference(props.schema)) {
      const key: string = props.schema.$ref.split("/").pop() ?? "";
      if (props.visited.has(key))
        return {
          schema: props.schema,
          escaped: {},
        };
      props.visited.add(key);
      return {
        ...getEscaped({
          components: props.components,
          schema: props.components.schemas?.[key] ?? {},
          visited: props.visited,
        }),
        schema: props.schema,
      };
    }
    return {
      schema: props.schema,
      escaped: props.schema,
    };
  };
}

interface IDiscriminator {
  items: IDiscriminatorItem[];
  remainders: OpenApi.IJsonSchema[];
}

interface IDiscriminatorItem {
  schema: OpenApi.IJsonSchema;
  predicator: (value: unknown) => boolean;
}

interface IResolvedSchema<
  Schema extends OpenApi.IJsonSchema = OpenApi.IJsonSchema,
> {
  schema: OpenApi.IJsonSchema;
  escaped: Schema;
}
interface IObjectSignificant {
  schema: OpenApi.IJsonSchema;
  escaped: OpenApi.IJsonSchema.IObject;
  properties: Map<string, OpenApi.IJsonSchema>;
}
