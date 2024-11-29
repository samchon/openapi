import { TestValidator } from "@nestia/e2e";
import { LlmSchemaConverter } from "@samchon/openapi/lib/converters/LlmSchemaConverter";
import typia, { IJsonSchemaCollection } from "typia";

export const test_gemini_schema_nullable = (): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      0 | 1 | 2 | 3 | null,
      (number & {}) | 1.2 | 2.3 | 3.4 | null,
      {
        id: string | null;
        value: number;
      } | null,
      Array<number> | null,
      Array<{
        nested: Array<{
          id: string | null;
        }>;
        nullable: Array<string | null>;
      }>,
      {
        first: ToJsonNull;
        second: ToJsonNull | null;
      },
      {
        first: ToJsonNull | null;
        second: ToJsonNull | null;
        third?: ToJsonNull | null;
      },
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

interface ToJsonNull {
  toJSON: () => null;
}
