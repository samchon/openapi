import { TestValidator } from "@nestia/e2e";
import { GeminiTypeChecker } from "@samchon/openapi";
import { GeminiSchemaComposer } from "@samchon/openapi/lib/composers/llm/GeminiSchemaComposer";

export const test_gemini_schema_constraint = (): void => {
  const result = GeminiSchemaComposer.schema({
    config: {
      recursive: false,
    },
    schema: {
      type: "number",
      minimum: 0,
      exclusiveMaximum: 3,
    },
    components: {},
  });
  TestValidator.predicate("schema")(
    () =>
      result.success &&
      GeminiTypeChecker.isNumber(result.value) &&
      !!result.value.description?.includes("@minimum 0") &&
      !!result.value.description?.includes("@exclusiveMaximum 3"),
  );
};
