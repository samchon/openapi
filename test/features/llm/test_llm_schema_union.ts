import { TestValidator } from "@nestia/e2e";
import { HttpLlm, ILlmSchema, OpenApi } from "@samchon/openapi";

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

  const llm: ILlmSchema | null = HttpLlm.schema({
    components,
    schema,
  });
  TestValidator.equals("union")(llm)({
    type: "number",
    enum: [3, 4, 5],
  });
};
