import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";

export const test_chatgpt_schema_enum_reference = (): void =>
  validate_llm_schema_enum_reference("chatgpt");

export const test_gemini_schema_enum_reference = (): void =>
  validate_llm_schema_enum_reference("gemini");

export const test_llm_v30_schema_enum_reference = (): void =>
  validate_llm_schema_enum_reference("3.0");

const validate_llm_schema_enum_reference = <
  Model extends "chatgpt" | "gemini" | "3.0",
>(
  model: Model,
): void => {
  const components: OpenApi.IComponents = {
    schemas: {
      named: {
        oneOf: [
          {
            const: 4,
          },
          {
            const: 5,
          },
        ],
      },
    },
  };
  const schema: OpenApi.IJsonSchema = {
    oneOf: [
      {
        const: 3,
      },
      {
        $ref: "#/components/schemas/named",
      },
    ],
  };

  const errors: string[] = [];
  const llm: ILlmSchema<Model> | null = LlmSchemaComposer.schema(model)({
    components,
    schema,
    config: LlmSchemaComposer.defaultConfig(model) as any,
    $defs: {},
    errors,
  }) as ILlmSchema<Model> | null;
  if (errors.length) console.log(model, errors);
  TestValidator.equals("union")(llm)({
    type: "number",
    enum: [3, 4, 5],
  });
};
