import { TestValidator } from "@nestia/e2e";
import { OpenApiTypeChecker } from "@samchon/openapi";

export const test_json_schema_type_checker_cover_nullable = (): void => {
  TestValidator.equals("(string | null) covers string")(true)(
    OpenApiTypeChecker.covers({})(
      {
        oneOf: [
          {
            type: "string",
          },
          {
            type: "null",
          },
        ],
      },
      {
        type: "string",
      },
    ),
  );
  TestValidator.equals("string can't cover (string | null)")(false)(
    OpenApiTypeChecker.covers({})(
      {
        type: "string",
      },
      {
        oneOf: [
          {
            type: "string",
          },
          {
            type: "null",
          },
        ],
      },
    ),
  );
};
