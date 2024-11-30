import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_nullable = (): void =>
  validate_llm_schema_nullable("chatgpt", "anyOf");

export const test_claude_schema_nullable = (): void =>
  validate_llm_schema_nullable("claude", "oneOf");

export const test_gemini_schema_nullable = (): void =>
  validate_llm_schema_nullable("gemini", "nullable");

export const test_llama_schema_nullable = (): void =>
  validate_llm_schema_nullable("llama", "oneOf");

export const test_llm_v30_schema_nullable = (): void =>
  validate_llm_schema_nullable("3.0", "nullable");

export const test_llm_v31_schema_nullable = (): void =>
  validate_llm_schema_nullable("3.1", "oneOf");

const validate_llm_schema_nullable = <Model extends ILlmSchema.Model>(
  model: Model,
  expected: "nullable" | "oneOf" | "anyOf",
): void => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<[number | null]>();
  const schema: ILlmSchema.IParameters<Model> = LlmSchemaComposer.schema(model)(
    {
      config: LlmSchemaComposer.defaultConfig(model) as any,
      components: collection.components,
      schema: typia.assert(collection.schemas[0]),
      $defs: {},
    },
  ) as ILlmSchema.IParameters<Model>;
  TestValidator.equals("nullable")(schema)(
    expected === "nullable"
      ? ({
          type: "number",
          nullable: true,
        } as any)
      : ({
          [expected]: [
            {
              type: "null",
            },
            {
              type: "number",
            },
          ],
        } as any),
  );
};
