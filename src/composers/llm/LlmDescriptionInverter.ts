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
    if (!description?.length) return {};

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
      description: lines.join("\n").trim(),
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
    if (!description?.length) return {};

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
        lines,
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
        lines,
      }),
      description: lines.join("\n").trim(),
    };
  };

  export const array = (
    description: string | undefined,
  ): Pick<
    OpenApi.IJsonSchema.IArray,
    "minItems" | "maxItems" | "uniqueItems" | "description"
  > => {
    if (!description?.length) return {};

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
      description: lines.join("\n").trim(),
    };
  };

  const find = <Type extends "boolean" | "number" | "string">(props: {
    type: Type;
    name: string;
    lines: string[];
  }):
    | (Type extends "boolean" ? true : Type extends "number" ? number : string)
    | undefined => {
    if (props.type === "boolean") {
      const index: number = props.lines.findIndex((line) =>
        line.startsWith(`@${props.name}`),
      );
      if (index === -1) return undefined as any;
      props.lines.splice(index, 1);
      return true as any;
    }
    for (let i: number = 0; i < props.lines.length; ++i) {
      const line: string = props.lines[i];
      if (line.startsWith(`@${props.name} `) === false) continue;
      const value: string = line.replace(`@${props.name} `, "").trim();
      if (props.type === "number") {
        if (isNaN(Number(value))) return undefined as any;
        props.lines.splice(i, 1);
        return Number(value) as any;
      }
      props.lines.splice(i, 1);
      return value as any;
    }
    return undefined as any;
  };
}
