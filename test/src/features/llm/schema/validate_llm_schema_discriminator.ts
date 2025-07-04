import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchemaV3_1,
  IOpenApiSchemaError,
  IResult,
  LlmTypeCheckerV3_1,
  OpenApi,
  OpenApiTypeChecker,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaUnit } from "typia";

export const test_llama_schema_discriminator = (): void =>
  validate_llm_schema_discriminator("llama");

const validate_llm_schema_discriminator = (
  vendor: "claude" | "deepseek" | "llama" | "3.1",
): void => {
  const $defs: Record<string, ILlmSchemaV3_1> = {};
  const unit: IJsonSchemaUnit = typia.json.schema<ICat | IAnt>();
  const result: IResult<ILlmSchemaV3_1, IOpenApiSchemaError> =
    LlmSchemaComposer.schema(vendor)({
      config: {
        reference: true,
        constraint: true,
      },
      $defs,
      components: unit.components,
      schema: unit.schema,
    });
  if (result.success === false) throw new Error("Failed to transform");
  TestValidator.predicate("discriminator")(
    () =>
      LlmTypeCheckerV3_1.isOneOf(result.value) &&
      result.value.discriminator !== undefined,
  );

  const invert: OpenApi.IJsonSchema = LlmSchemaComposer.invert(vendor)({
    components: {},
    $defs,
    schema: result.value,
  });
  TestValidator.predicate("invert")(
    () =>
      OpenApiTypeChecker.isOneOf(invert) && invert.discriminator !== undefined,
  );
};

interface ICat {
  type: "cat";
  name: string;
  ribbon: boolean;
}
interface IAnt {
  type: "ant";
  name: string;
  role: "queen" | "soldier" | "worker";
}
