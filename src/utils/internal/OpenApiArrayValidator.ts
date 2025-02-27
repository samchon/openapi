import { OpenApi } from "../../OpenApi";
import { IOpenApiValidatorContext } from "./IOpenApiValidatorContext";
import { OpenApiStationValidator } from "./OpenApiStationValidator";

export namespace OpenApiArrayValidator {
  export const validate = (
    ctx: IOpenApiValidatorContext<OpenApi.IJsonSchema.IArray>,
  ): boolean => {
    if (!Array.isArray(ctx.value)) return false;
    return [
      ctx.value
        .map((value, i) =>
          OpenApiStationValidator.validate({
            ...ctx,
            schema: ctx.schema.items,
            value,
            path: `${ctx.path}[${i}]`,
            required: true,
          }),
        )
        .every((v) => v),
      ctx.schema.minItems !== undefined
        ? ctx.value.length >= ctx.schema.minItems
        : true,
      ctx.schema.maxItems !== undefined
        ? ctx.value.length <= ctx.schema.maxItems
        : true,
      ctx.schema.uniqueItems !== undefined
        ? ctx.schema.uniqueItems
          ? new Set(ctx.value).size === ctx.value.length
          : true
        : true,
    ].every((v) => v);
  };
}
