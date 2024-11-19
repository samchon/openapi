import { TestValidator } from "@nestia/e2e";
import { ILlmSchemaV3, OpenApi } from "@samchon/openapi";
import { LlmConverterV3 } from "@samchon/openapi/lib/converters/LlmConverterV3";

export const test_llm_schema_union = (): void => {
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

  const llm: ILlmSchemaV3 | null = LlmConverterV3.schema({
    components,
    schema,
    recursive: false,
  });
  TestValidator.equals("union")(llm)({
    type: "number",
    enum: [3, 4, 5],
  });
};
