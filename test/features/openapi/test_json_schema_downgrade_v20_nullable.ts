import { TestValidator } from "@nestia/e2e";
import { OpenApi, SwaggerV2 } from "@samchon/openapi";
import { SwaggerV2Downgrader } from "@samchon/openapi/lib/converters/SwaggerV2Downgrader";

export const test_json_schema_downgrade_v20_nullable = (): void => {
  const original: OpenApi.IComponents = {
    schemas: {
      union: {
        oneOf: [
          {
            type: "null",
          },
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      },
    },
  };
  const components: Record<string, SwaggerV2.IJsonSchema> = {};
  const schema: SwaggerV2.IJsonSchema = SwaggerV2Downgrader.downgradeSchema({
    original,
    downgraded: components,
  })({
    oneOf: [
      {
        type: "boolean",
      },
      {
        $ref: "#/components/schemas/union",
      },
    ],
  } satisfies OpenApi.IJsonSchema);
  TestValidator.equals("nullable")({
    components,
    schema,
  })({
    components: {
      "union.Nullable": {
        "x-oneOf": [
          {
            type: "string",
            "x-nullable": true,
          },
          {
            type: "number",
            "x-nullable": true,
          },
        ],
      },
    },
    schema: {
      "x-oneOf": [
        {
          type: "boolean",
          "x-nullable": true,
        },
        {
          $ref: "#/definitions/union.Nullable",
        },
      ],
    },
  });
};
