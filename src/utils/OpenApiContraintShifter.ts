import { OpenApi } from "../OpenApi";

export namespace OpenApiContraintShifter {
  export const shiftArray = <
    Schema extends Pick<
      OpenApi.IJsonSchema.IArray,
      "description" | "minItems" | "maxItems" | "uniqueItems"
    >,
  >(
    v: Schema,
  ): Omit<Schema, "minItems" | "maxItems" | "uniqueItems"> => {
    const tags: string[] = [];
    if (v.minItems !== undefined) {
      tags.push(`@minItems ${v.minItems}`);
      delete v.minItems;
    }
    if (v.maxItems !== undefined) {
      tags.push(`@maxItems ${v.maxItems}`);
      delete v.maxItems;
    }
    if (v.uniqueItems !== undefined) {
      if (v.uniqueItems === true) tags.push(`@uniqueItems`);
      delete v.uniqueItems;
    }
    v.description = writeTagWithDescription({
      description: v.description,
      tags,
    });
    return v;
  };

  export const shiftNumeric = <
    Schema extends Pick<
      OpenApi.IJsonSchema.INumber | OpenApi.IJsonSchema.IInteger,
      | "description"
      | "minimum"
      | "maximum"
      | "exclusiveMinimum"
      | "exclusiveMaximum"
      | "multipleOf"
      | "default"
    >,
  >(
    v: Schema,
  ): Omit<
    Schema,
    | "minimum"
    | "maximum"
    | "exclusiveMinimum"
    | "exclusiveMaximum"
    | "multipleOf"
    | "default"
  > => {
    const tags: string[] = [];
    if (v.minimum !== undefined) {
      tags.push(`@minimum ${v.minimum}`);
      delete v.minimum;
    }
    if (v.maximum !== undefined) {
      tags.push(`@maximum ${v.maximum}`);
      delete v.maximum;
    }
    if (v.exclusiveMinimum !== undefined) {
      tags.push(`@exclusiveMinimum ${v.exclusiveMinimum}`);
      delete v.exclusiveMinimum;
    }
    if (v.exclusiveMaximum !== undefined) {
      tags.push(`@exclusiveMaximum ${v.exclusiveMaximum}`);
      delete v.exclusiveMaximum;
    }
    if (v.multipleOf !== undefined) {
      tags.push(`@multipleOf ${v.multipleOf}`);
      delete v.multipleOf;
    }
    if (v.default !== undefined) {
      tags.push(`@default ${v.default}`);
      delete v.default;
    }
    v.description = writeTagWithDescription({
      description: v.description,
      tags,
    });
    return v;
  };

  export const shiftString = <
    Schema extends Pick<
      OpenApi.IJsonSchema.IString,
      | "description"
      | "minLength"
      | "maxLength"
      | "format"
      | "pattern"
      | "contentMediaType"
      | "default"
    >,
  >(
    v: Schema,
  ): Omit<
    Schema,
    | "minLength"
    | "maxLength"
    | "format"
    | "pattern"
    | "contentMediaType"
    | "default"
  > => {
    const tags: string[] = [];
    if (v.minLength !== undefined) {
      tags.push(`@minLength ${v.minLength}`);
      delete v.minLength;
    }
    if (v.maxLength !== undefined) {
      tags.push(`@maxLength ${v.maxLength}`);
      delete v.maxLength;
    }
    if (v.format !== undefined) {
      tags.push(`@format ${v.format}`);
      delete v.format;
    }
    if (v.pattern !== undefined) {
      tags.push(`@pattern ${v.pattern}`);
      delete v.pattern;
    }
    if (v.contentMediaType !== undefined) {
      tags.push(`@contentMediaType ${v.contentMediaType}`);
      delete v.contentMediaType;
    }
    if (v.default !== undefined) {
      tags.push(`@default ${v.default}`);
      delete v.default;
    }
    v.description = writeTagWithDescription({
      description: v.description,
      tags,
    });
    return v;
  };
}

const writeTagWithDescription = (props: {
  description: string | undefined;
  tags: string[];
}): string | undefined => {
  if (props.tags.length === 0) return props.description;
  return [
    ...(props.description?.length ? [props.description, "\n"] : []),
    ...props.tags,
  ].join("\n");
};
