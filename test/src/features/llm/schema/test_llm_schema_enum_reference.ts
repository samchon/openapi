import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";

export const test_llm_schema_enum_reference = (): void => {
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

  const result: IResult<ILlmSchema, IOpenApiSchemaError> =
    LlmSchemaComposer.schema({
      components,
      schema,
      $defs: {},
      config: {
        reference: false,
      },
    });
  TestValidator.equals(
    "success",
    (key) => key === "description",
  )(result.success)(true);
  TestValidator.equals(
    "union",
    (key) => key === "description",
  )(result.success ? result.value : {})({
    type: "number",
    enum: [3, 4, 5],
  });
};
