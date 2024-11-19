import { TestValidator } from "@nestia/e2e";
import { ILlmSchemaV3, OpenApi } from "@samchon/openapi";
import { LlmConverterV3 } from "@samchon/openapi/lib/converters/LlmConverterV3";

export const test_llm_schema_union = (): void => {
  const components: OpenApi.IComponents = {
    schemas: {
      union1: {
        oneOf: [
          {
            type: "string",
          },
          {
            type: "number",
          },
          {
            $ref: "#/components/schemas/union2",
          },
        ],
      },
      union2: {
        oneOf: [
          {
            type: "boolean",
          },
          {
            type: "null",
          },
        ],
      },
    },
  };
  const schema: OpenApi.IJsonSchema = {
    oneOf: [
      {
        type: "boolean",
      },
      {
        $ref: "#/components/schemas/union1",
      },
    ],
  };
  const llm: ILlmSchemaV3 | null = LlmConverterV3.schema({
    components,
    schema,
    recursive: false,
  });
  TestValidator.equals("nullable")(llm)({
    oneOf: [
      { type: "boolean", nullable: true },
      { type: "string", nullable: true },
      { type: "number", nullable: true },
      { type: "boolean", nullable: true },
    ],
  });
};
