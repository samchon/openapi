import { OpenApi } from "../../OpenApi";

export namespace LlmDescriptionInverter {
  export const numeric = (
    description: string | undefined,
  ): Pick<
    OpenApi.IJsonSchema.INumber,
    | "minimum"
    | "maximum"
    | "exclusiveMinimum"
    | "exclusiveMaximum"
    | "multipleOf"
    | "description"
  > => {
    if (description === undefined) return {};

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
      description: describe(lines, [
        "minimum",
        "maximum",
        "exclusiveMinimum",
        "exclusiveMaximum",
        "multipleOf",
      ]),
    };
  };

  export const string = (
    description: string | undefined,
  ): Pick<
    OpenApi.IJsonSchema.IString,
    | "format"
    | "pattern"
    | "contentMediaType"
    | "minLength"
    | "maxLength"
    | "description"
  > => {
    if (description === undefined) return {};

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
      description: describe(lines, [
        "format",
        "pattern",
        "contentMediaType",
        "minLength",
        "maxLength",
      ]),
    };
  };

  export const array = (
    description: string | undefined,
  ): Pick<
    OpenApi.IJsonSchema.IArray,
    "minItems" | "maxItems" | "uniqueItems" | "description"
  > => {
    if (description === undefined) return {};

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
      description: describe(lines, ["minItems", "maxItems", "uniqueItems"]),
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

  const describe = (lines: string[], tags: string[]): string | undefined => {
    const ret = trimArray(
      lines
        .map((str) => str.trim())
        .filter((str) => {
          str = str.trim();
          return tags.every((tag) => str.startsWith(`@${tag}`) === false);
        }),
    ).join("\n");
    return ret.length === 0 ? undefined : ret;
  };

  const trimArray = (array: string[]): string[] => {
    let first: number = 0;
    let last: number = array.length - 1;

    for (; first < array.length; ++first)
      if (array[first]!.trim().length !== 0) break;
    for (; last >= 0; --last) if (array[last]!.trim().length !== 0) break;
    return array.slice(first, last + 1);
  };
}
