import { TestValidator } from "@nestia/e2e";
import { OpenApiTypeChecker } from "@samchon/openapi";
import typia from "typia";

export const test_issue_121_reference_accessor = (): void => {
  const collection = typia.json.application<[IMember]>();
  const accessors: string[] = [];
  OpenApiTypeChecker.visit({
    closure: (_schema, acc) => {
      accessors.push(acc);
    },
    components: collection.components,
    schema: collection.schemas[0],
  });
  TestValidator.equals("accessors")(accessors)([
    "$input.schema",
    '$input.components.schemas["IMember"]',
    '$input.components.schemas["IMember"].properties["id"]',
    '$input.components.schemas["IMember"].properties["age"]',
  ]);
};

interface IMember {
  id: string;
  age: number;
}
