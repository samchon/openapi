import { OpenApi } from "../OpenApi";
import { ILlmSchemaV3 } from "../structures/ILlmSchemaV3";
import { LlmTypeCheckerV3 } from "../utils/LlmTypeCheckerV3";
import { OpenApiTypeChecker } from "../utils/OpenApiTypeChecker";
import { OpenApiV3Downgrader } from "./OpenApiV3Downgrader";

export namespace LlmConverterV3 {
  export const parameters = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema.IObject;
    recursive: false | number;
  }): ILlmSchemaV3.IParameters | null =>
    schema(props) as ILlmSchemaV3.IParameters | null;

  export const schema = (props: {
    components: OpenApi.IComponents;
    schema: OpenApi.IJsonSchema;
    recursive: false | number;
  }): ILlmSchemaV3 | null => {
    const resolved: OpenApi.IJsonSchema | null = OpenApiTypeChecker.escape({
      components: props.components,
      schema: props.schema,
      recursive: props.recursive,
    });
    if (resolved === null) return null;
    const downgraded: ILlmSchemaV3 = OpenApiV3Downgrader.downgradeSchema({
      original: {},
      downgraded: {},
    })(resolved) as ILlmSchemaV3;
    LlmTypeCheckerV3.visit(downgraded, (schema) => {
      if (
        LlmTypeCheckerV3.isOneOf(schema) &&
        (schema as any).discriminator !== undefined
      )
        delete (schema as any).discriminator;
    });
    return downgraded;
  };

  export const separate = (props: {
    predicate: (schema: ILlmSchemaV3) => boolean;
    schema: ILlmSchemaV3;
  }): [ILlmSchemaV3 | null, ILlmSchemaV3 | null] => {
    if (props.predicate(props.schema) === true) return [null, props.schema];
    else if (
      LlmTypeCheckerV3.isUnknown(props.schema) ||
      LlmTypeCheckerV3.isOneOf(props.schema)
    )
      return [props.schema, null];
    else if (LlmTypeCheckerV3.isObject(props.schema))
      return separateObject({
        predicate: props.predicate,
        schema: props.schema,
      });
    else if (LlmTypeCheckerV3.isArray(props.schema))
      return separateArray({
        predicate: props.predicate,
        schema: props.schema,
      });
    return [props.schema, null];
  };

  const separateArray = (props: {
    predicate: (schema: ILlmSchemaV3) => boolean;
    schema: ILlmSchemaV3.IArray;
  }): [ILlmSchemaV3.IArray | null, ILlmSchemaV3.IArray | null] => {
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
    predicate: (schema: ILlmSchemaV3) => boolean;
    schema: ILlmSchemaV3.IObject;
  }): [ILlmSchemaV3.IObject | null, ILlmSchemaV3.IObject | null] => {
    if (
      !!props.schema.additionalProperties ||
      Object.keys(props.schema.properties ?? {}).length === 0
    )
      return [props.schema, null];
    const llm = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3>,
    } satisfies ILlmSchemaV3.IObject;
    const human = {
      ...props.schema,
      properties: {} as Record<string, ILlmSchemaV3>,
    } satisfies ILlmSchemaV3.IObject;
    for (const [key, value] of Object.entries(props.schema.properties ?? {})) {
      const [x, y] = separate({
        predicate: props.predicate,
        schema: value,
      });
      if (x !== null) llm.properties[key] = x;
      if (y !== null) human.properties[key] = y;
    }
    return [
      Object.keys(llm.properties).length === 0 ? null : shrinkRequired(llm),
      Object.keys(human.properties).length === 0 ? null : shrinkRequired(human),
    ];
  };

  const shrinkRequired = (s: ILlmSchemaV3.IObject): ILlmSchemaV3.IObject => {
    if (s.required !== undefined)
      s.required = s.required.filter(
        (key) => s.properties?.[key] !== undefined,
      );
    return s;
  };
}
