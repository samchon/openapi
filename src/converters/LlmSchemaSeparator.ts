import { ILlmProcedure } from "../structures/ILlmProcedure";
import { ILlmSchema } from "../structures/ILlmSchema";
import { LlmTypeChecker } from "../utils/LlmTypeChecker";

export namespace LlmSchemaSeparator {
  export interface IProps {
    parameters: ILlmSchema[];
    predicator: (schema: ILlmSchema) => boolean;
  }
  export const parameters = (props: IProps): ILlmProcedure.ISeparated => {
    const indexes: Array<[ILlmSchema | null, ILlmSchema | null]> =
      props.parameters.map(schema(props.predicator));
    return {
      llm: indexes
        .map(([llm], index) => ({
          index,
          schema: llm!,
        }))
        .filter(({ schema }) => schema !== null),
      human: indexes
        .map(([, human], index) => ({
          index,
          schema: human!,
        }))
        .filter(({ schema }) => schema !== null),
    };
  };

  export const schema =
    (predicator: (schema: ILlmSchema) => boolean) =>
    (input: ILlmSchema): [ILlmSchema | null, ILlmSchema | null] => {
      if (predicator(input) === true) return [null, input];
      else if (LlmTypeChecker.isUnknown(input) || LlmTypeChecker.isOneOf(input))
        return [input, null];
      else if (LlmTypeChecker.isObject(input))
        return separateObject(predicator)(input);
      else if (LlmTypeChecker.isArray(input))
        return separateArray(predicator)(input);
      return [input, null];
    };

  const separateArray =
    (predicator: (schema: ILlmSchema) => boolean) =>
    (
      input: ILlmSchema.IArray,
    ): [ILlmSchema.IArray | null, ILlmSchema.IArray | null] => {
      const [x, y] = schema(predicator)(input.items);
      return [
        x !== null ? { ...input, items: x } : null,
        y !== null ? { ...input, items: y } : null,
      ];
    };

  const separateObject =
    (predicator: (schema: ILlmSchema) => boolean) =>
    (
      input: ILlmSchema.IObject,
    ): [ILlmSchema.IObject | null, ILlmSchema.IObject | null] => {
      if (
        !!input.additionalProperties ||
        Object.keys(input.properties ?? {}).length === 0
      )
        return [input, null];
      const llm = {
        ...input,
        properties: {} as Record<string, ILlmSchema>,
      } satisfies ILlmSchema.IObject;
      const human = {
        ...input,
        properties: {} as Record<string, ILlmSchema>,
      } satisfies ILlmSchema.IObject;
      for (const [key, value] of Object.entries(input.properties ?? {})) {
        const [x, y] = schema(predicator)(value);
        if (x !== null) llm.properties[key] = x;
        if (y !== null) human.properties[key] = y;
      }
      return [
        Object.keys(llm.properties).length === 0 ? null : shrinkRequired(llm),
        Object.keys(human.properties).length === 0
          ? null
          : shrinkRequired(human),
      ];
    };

  const shrinkRequired = (input: ILlmSchema.IObject): ILlmSchema.IObject => {
    if (input.required !== undefined)
      input.required = input.required.filter(
        (key) => input.properties?.[key] !== undefined,
      );
    return input;
  };
}
