import { TestValidator } from "@nestia/e2e";
import { OpenApiV3Downgrader } from "@samchon/openapi/lib/converters/OpenApiV3Downgrader";
import typia from "typia";

export const test_json_schema_downgrade_v30_tuple = (): void => {
  const collection = typia.json.application<[[false, 1, 2, "three", null]]>();
  const schema = OpenApiV3Downgrader.downgradeSchema({
    original: collection.components,
    downgraded: {},
  })(collection.schemas[0]);
  TestValidator.equals("tuple")(schema)({
    type: "array",
    items: {
      oneOf: [
        {
          type: "boolean",
          enum: [false],
          nullable: true,
        },
        {
          type: "number",
          enum: [1, 2],
          nullable: true,
        },
        {
          type: "string",
          enum: ["three"],
          nullable: true,
        },
      ],
    },
    minItems: 5,
    maxItems: 5,
  });
};
