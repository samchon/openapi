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

export const test_claude_schema_discriminator = (): void =>
  validate_llm_schema_discriminator("claude");

export const test_deepseek_schema_discriminator = (): void =>
  validate_llm_schema_discriminator("deepseek");

export const test_llama_schema_discriminator = (): void =>
  validate_llm_schema_discriminator("llama");

export const test_llama_v31_schema_discriminator = (): void =>
  validate_llm_schema_discriminator("3.1");

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
      result.value.discriminator !== undefined &&
      result.value.discriminator.mapping !== undefined &&
      Object.values(result.value.discriminator.mapping).every((k) =>
        k.startsWith("#/$defs/"),
      ),
  );

  const invert: OpenApi.IJsonSchema = LlmSchemaComposer.invert(vendor)({
    components: {},
    $defs,
    schema: result.value,
  });
  TestValidator.predicate("invert")(
    () =>
      OpenApiTypeChecker.isOneOf(invert) &&
      invert.discriminator !== undefined &&
      invert.discriminator.mapping !== undefined &&
      Object.values(invert.discriminator.mapping).every((k) =>
        k.startsWith("#/components/schemas/"),
      ),
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
