import { TestValidator } from "@nestia/e2e";
import { SwaggerV2Downgrader } from "@samchon/openapi/lib/converters/SwaggerV2Downgrader";
import typia from "typia";

export const test_json_schema_downgrade_v20_tuple = (): void => {
  const collection = typia.json.application<[[false, 1, 2, "three", null]]>();
  const schema = SwaggerV2Downgrader.downgradeSchema({
    original: collection.components,
    downgraded: {},
  })(collection.schemas[0]);
  TestValidator.equals("tuple")(schema)({
    type: "array",
    items: {
      "x-oneOf": [
        {
          type: "boolean",
          enum: [false],
          "x-nullable": true,
        },
        {
          type: "number",
          enum: [1, 2],
          "x-nullable": true,
        },
        {
          type: "string",
          enum: ["three"],
          "x-nullable": true,
        },
      ],
    },
    minItems: 5,
    maxItems: 5,
  });
};
