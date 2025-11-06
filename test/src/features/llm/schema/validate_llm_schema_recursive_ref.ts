import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, IOpenApiSchemaError, IResult } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";

export const test_chatgpt_schema_recursive_ref = (): void =>
  validate_llm_schema_recursive_ref("chatgpt");

export const test_claude_schema_recursive_ref = (): void =>
  validate_llm_schema_recursive_ref("claude");

export const test_llm_v31_schema_recursive_ref = (): void =>
  validate_llm_schema_recursive_ref("3.1");

const validate_llm_schema_recursive_ref = <
  Model extends Exclude<ILlmSchema.Model, "gemini" | "3.0">,
>(
  model: Model,
): void => {
  const $defs: Record<string, ILlmSchema<Model>> = {};
  const result: IResult<
    ILlmSchema<Model>,
    IOpenApiSchemaError
  > = LlmSchemaComposer.schema(model)({
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
  }) as IResult<ILlmSchema<Model>, IOpenApiSchemaError>;
  TestValidator.equals("success")(result.success)(true);
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
  TestValidator.equals("schema")(result.success ? result.value : {})({
    $ref: "#/$defs/Department",
  });
};
