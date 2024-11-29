import { TestValidator } from "@nestia/e2e";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_gemini_schema_enum = (): void => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<
      [
        0 | 1 | 2,
        (number & {}) | 1.2 | 2.3 | 3.4,
        (number & tags.Type<"int32">) | 1 | 2 | 3,
        "one" | "two" | "three",
      ]
    >();
  for (const schema of collection.schemas) {
    const errors: string[] = [];
    const gemini = LlmSchemaConverter.schema("gemini")({
      config: LlmSchemaConverter.defaultConfig("gemini"),
      components: collection.components,
      schema,
      errors,
    });
    TestValidator.equals("success")(!!gemini)(true);
  }
};
