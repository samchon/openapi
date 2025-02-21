import { OpenApi } from "../../OpenApi";

export namespace LlmDescriptionInverter {
  export const numeric = (
    description: string,
  ): Pick<
    OpenApi.IJsonSchema.INumber,
    | "minimum"
    | "maximum"
    | "exclusiveMinimum"
    | "exclusiveMaximum"
    | "multipleOf"
  > => {
    const lines: string[] = description.split("\n");
    const exclusiveMinimum: number | undefined = find({
      type: "number",
      name: "exclusiveMinimum",
      lines,
    });
    const exclusiveMaximum: number | undefined = find({
      type: "number",
      name: "exclusiveMaximum",
      lines,
    });
    return {
      minimum:
        exclusiveMinimum ??
        find({
          type: "number",
          name: "minimum",
          lines,
        }),
      maximum:
        exclusiveMaximum ??
        find({
          type: "number",
          name: "maximum",
          lines,
        }),
      exclusiveMinimum: exclusiveMinimum !== undefined ? true : undefined,
      exclusiveMaximum: exclusiveMaximum !== undefined ? true : undefined,
      multipleOf: find({
        type: "number",
        name: "multipleOf",
        lines,
      }),
    };
  };

  export const string = (
    description: string,
  ): Pick<
    OpenApi.IJsonSchema.IString,
    "format" | "pattern" | "contentMediaType" | "minLength" | "maxLength"
  > => {
    const lines: string[] = description.split("\n");
    return {
      format: find({
        type: "string",
        name: "format",
        lines,
      }),
      pattern: find({
        type: "string",
        name: "pattern",
        lines: description.split("\n"),
      }),
      contentMediaType: find({
        type: "string",
        name: "contentMediaType",
        lines,
      }),
      minLength: find({
        type: "number",
        name: "minLength",
        lines,
      }),
      maxLength: find({
        type: "number",
        name: "maxLength",
        lines: description.split("\n"),
      }),
    };
  };

  export const array = (
    description: string,
  ): Pick<
    OpenApi.IJsonSchema.IArray,
    "minItems" | "maxItems" | "uniqueItems"
  > => {
    const lines: string[] = description.split("\n");
    return {
      minItems: find({
        type: "number",
        name: "minItems",
        lines,
      }),
      maxItems: find({
        type: "number",
        name: "maxItems",
        lines,
      }),
      uniqueItems: find({
        type: "boolean",
        name: "uniqueItems",
        lines,
      }),
    };
  };

  const find = <Type extends "boolean" | "number" | "string">(props: {
    type: Type;
    name: string;
    lines: string[];
  }):
    | (Type extends "boolean" ? true : Type extends "number" ? number : string)
    | undefined => {
    if (props.type === "boolean")
      return props.lines.some((line) => line.startsWith(`@${props.name}`))
        ? true
        : (undefined as any);
    for (const line of props.lines) {
      if (line.startsWith(`@${props.name} `) === false) continue;
      const value: string = line.replace(`@${props.name} `, "").trim();
      if (props.type === "number")
        return (isNaN(Number(value)) ? undefined : Number(value)) satisfies
          | number
          | undefined as any;
      return value as any;
    }
    return undefined as any;
  };
}
