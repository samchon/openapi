import { OpenApi } from "../../OpenApi";
import { IOpenApiValidatorContext } from "./IOpenApiValidatorContext";

export namespace OpenApiStationValidator {
  export const validate = (
    ctx: IOpenApiValidatorContext<OpenApi.IJsonSchema>,
  ): boolean => {
    if (ctx.value === undefined) return ctx.required === false;
  };
}
