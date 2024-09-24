import { TestValidator } from "@nestia/e2e";
import { OpenApi, OpenApiV3 } from "@samchon/openapi";
import { OpenApiV3Downgrader } from "@samchon/openapi/lib/converters/OpenApiV3Downgrader";

export const test_json_schema_downgrade_v30_nullable = (): void => {
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
  const components: OpenApiV3.IComponents = {
    schemas: {},
  };
  const schema: OpenApiV3.IJsonSchema = OpenApiV3Downgrader.downgradeSchema({
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
      schemas: {
        "union.Nullable": {
          oneOf: [
            {
              type: "string",
              nullable: true,
            },
            {
              type: "number",
              nullable: true,
            },
          ],
        },
      },
    },
    schema: {
      oneOf: [
        {
          type: "boolean",
          nullable: true,
        },
        {
          $ref: "#/components/schemas/union.Nullable",
        },
      ],
    },
  });
};
