import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, IOpenApiSchemaError, IResult } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia from "typia";

export const test_chatgpt_schema_additionalProperties = (): void => {
  interface IMember {
    name: string;
    age: number;
    hobby: Record<string, string>;
  }
  const collection = typia.json.schemas<[IMember]>();
  const result: IResult<ILlmSchema, IOpenApiSchemaError> =
    LlmSchemaComposer.schema({
      $defs: {},
      components: collection.components,
      schema: collection.schemas[0],
    });
  TestValidator.equals("success")(result.success)(true);
};
