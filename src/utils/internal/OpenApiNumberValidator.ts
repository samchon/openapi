import { OpenApi } from "../../OpenApi";
import { IOpenApiValidatorContext } from "./IOpenApiValidatorContext";

export namespace OpenApiNumberValidator {
  export const validate = (
    ctx: IOpenApiValidatorContext<OpenApi.IJsonSchema.INumber>,
  ): boolean => {
    if (typeof ctx.value !== "number") return false;
    return [
      ctx.schema.minimum !== undefined
        ? ctx.schema.exclusiveMinimum
          ? ctx.value > ctx.schema.minimum
          : ctx.value >= ctx.schema.minimum
        : true,
      ctx.schema.maximum !== undefined
        ? ctx.schema.exclusiveMaximum
          ? ctx.value < ctx.schema.maximum
          : ctx.value <= ctx.schema.maximum
        : true,
      ctx.schema.multipleOf !== undefined
        ? ctx.value % ctx.schema.multipleOf === 0
        : true,
    ].every((v) => v);
  };
}
