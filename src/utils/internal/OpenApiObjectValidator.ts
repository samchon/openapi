import { OpenApi } from "../../OpenApi";
import { NamingConvention } from "../NamingConvention";
import { IOpenApiValidatorContext } from "./IOpenApiValidatorContext";
import { OpenApiStationValidator } from "./OpenApiStationValidator";

export namespace OpenApiObjectValidator {
  export const validate = (
    ctx: IOpenApiValidatorContext<OpenApi.IJsonSchema.IObject>,
  ): boolean => {
    if (typeof ctx.value !== "object" || ctx.value === null)
      return ctx.report(ctx);
    return [
      ...Object.entries(ctx.schema.properties ?? {}).map(([key, value]) =>
        OpenApiStationValidator.validate({
          ...ctx,
          schema: value,
          value: (ctx.value as Record<string, any>)[key],
          path:
            ctx.path +
            (NamingConvention.variable(key)
              ? `.${key}`
              : `[${JSON.stringify(key)}]`),
          required: ctx.schema.required?.includes(key) ?? false,
        }),
      ),
      ...(typeof ctx.schema.additionalProperties === "object" &&
      ctx.schema.additionalProperties !== null
        ? Object.entries(ctx.value)
            .filter(
              ([key]) =>
                Object.keys(ctx.schema.properties ?? {}).includes(key) ===
                false,
            )
            .map(([key, value]) =>
              OpenApiStationValidator.validate({
                ...ctx,
                schema: ctx.schema.additionalProperties as OpenApi.IJsonSchema,
                value,
                path:
                  ctx.path +
                  (NamingConvention.variable(key)
                    ? `.${key}`
                    : `[${JSON.stringify(key)}]`),
                required: true,
              }),
            )
        : []),
    ].every((v) => v);
  };
}
