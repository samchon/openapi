import { OpenApi, OpenApiV3 } from "../../src";
import { OpenApiV3Downgrader } from "../../src/internal/OpenApiV3Downgrader";
import { TestValidator } from "@nestia/e2e";

export const test_downgrade_v30 = () => {
  const schema: OpenApi.IJsonSchema = {
    oneOf: [{ const: "a" }, { const: "b" }, { const: "c" }],
    title: "something",
    description: "nothing",
  };
  const downgraded: OpenApiV3.IJsonSchema = OpenApiV3Downgrader.downgradeSchema(
    {
      original: {},
      downgraded: {},
    },
  )(schema);
  TestValidator.equals("enum")(downgraded)({
    type: "string",
    title: "something",
    description: "nothing",
    enum: ["a", "b", "c"],
  });
};
