import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_tuple = (): void =>
  validate_llm_schema_tuple("chatgpt");

export const test_claude_schema_tuple = (): void =>
  validate_llm_schema_tuple("claude");

export const test_gemini_schema_tuple = (): void =>
  validate_llm_schema_tuple("gemini");

export const test_llama_schema_tuple = (): void =>
  validate_llm_schema_tuple("llama");

export const test_llm_v30_schema_tuple = (): void =>
  validate_llm_schema_tuple("3.0");

export const test_llm_v31_schema_tuple = (): void =>
  validate_llm_schema_tuple("3.1");

const validate_llm_schema_tuple = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      [string, number],
      {
        input: [boolean, string];
        output: [number, boolean];
      },
      Array<{
        nested: {
          x: {
            y: [string, number];
            z: number;
          };
          alpha: Array<number>;
        };
      }>,
    ]
  >();
  const v = validate(model)(collection.components);
  v(collection.schemas[0])(["$input"]);
  v(collection.schemas[1])([
    `$input.properties["input"]`,
    `$input.properties["output"]`,
  ]);
  v(collection.schemas[2])([
    `$input.items.properties["nested"].properties["x"].properties["y"]`,
  ]);
};

const validate =
  <Model extends ILlmSchema.Model>(model: Model) =>
  (components: OpenApi.IComponents) =>
  (schema: OpenApi.IJsonSchema) =>
  (expected: string[]): void => {
    const errors: string[] = [];
    const converted: ILlmSchema<Model> | null = LlmSchemaComposer.schema(model)(
      {
        config: LlmSchemaComposer.defaultConfig(
          model,
        ) satisfies ILlmSchema.IConfig<Model> as any,
        errors,
        accessor: "$input",
        components,
        schema,
        $defs: {},
      },
    ) as ILlmSchema<Model> | null;
    TestValidator.equals("tuple")(converted)(null);
    TestValidator.equals("errors")(errors.map((e) => e.split(":")[0]).sort())(
      expected.sort(),
    );
  };
