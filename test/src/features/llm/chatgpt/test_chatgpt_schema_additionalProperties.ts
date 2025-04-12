import { TestValidator } from "@nestia/e2e";
import { ChatGptSchemaComposer } from "@samchon/openapi/lib/composers/llm/ChatGptSchemaComposer";
import typia from "typia";

export const test_chatgpt_schema_additionalProperties = (): void => {
  interface IMember {
    name: string;
    age: number;
    hobby: Record<string, string>;
  }
  const collection = typia.json.schemas<[IMember]>();
  for (const strict of [false, true]) {
    const result = ChatGptSchemaComposer.schema({
      config: {
        reference: false,
        strict,
      },
      $defs: {},
      components: collection.components,
      schema: collection.schemas[0],
    });
    TestValidator.equals("success")(result.success)(!strict);
  }
};
