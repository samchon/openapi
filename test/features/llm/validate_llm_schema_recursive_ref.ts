import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";

export const test_chatgpt_schema_recursive_ref = (): void =>
  validate_llm_schema_recursive_ref("chatgpt");

export const test_claude_schema_recursive_ref = (): void =>
  validate_llm_schema_recursive_ref("claude");

export const test_llama_schema_recursive_ref = (): void =>
  validate_llm_schema_recursive_ref("llama");

export const test_llm_v31_schema_recursive_ref = (): void =>
  validate_llm_schema_recursive_ref("3.1");

const validate_llm_schema_recursive_ref = <
  Model extends Exclude<ILlmSchema.Model, "gemini" | "3.0">,
>(
  model: Model,
): void => {
  const $defs: Record<string, ILlmSchema<Model>> = {};
  const schema: ILlmSchema | null = LlmSchemaComposer.schema(model)({
    $defs: $defs as any,
    components: {
      schemas: {
        Department: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            children: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Department",
              },
            },
          },
          required: ["name", "children"],
        },
      },
    },
    schema: {
      $ref: "#/components/schemas/Department",
    },
    config: {
      ...(LlmSchemaComposer.defaultConfig(model) as any),
      reference: false,
    },
  });
  TestValidator.equals("$defs")({
    Department: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        children: {
          type: "array",
          items: {
            $ref: "#/$defs/Department",
          },
        },
      },
      required: ["name", "children"],
    },
  })($defs as any);
  TestValidator.equals("schema")(schema)({
    $ref: "#/$defs/Department",
  });
};
