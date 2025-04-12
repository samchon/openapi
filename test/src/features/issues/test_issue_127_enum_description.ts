import { TestValidator } from "@nestia/e2e";
import { OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_issue_127_enum_description = (): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<[ISomething]>();
  const chatgpt = LlmSchemaComposer.parameters("chatgpt")({
    config: LlmSchemaComposer.defaultConfig("chatgpt"),
    components: collection.components,
    schema: collection.schemas[0] as OpenApi.IJsonSchema.IReference,
  });
  TestValidator.equals("description")(
    chatgpt.success ? chatgpt.value.properties.value.description : "",
  )("The description.");

  const gemini = LlmSchemaComposer.parameters("gemini")({
    config: LlmSchemaComposer.defaultConfig("gemini"),
    components: collection.components,
    schema: collection.schemas[0] as OpenApi.IJsonSchema.IReference,
  });
  TestValidator.equals("description")(
    gemini.success ? gemini.value.properties.value.description : "",
  )("The description.");
};

interface ISomething {
  /**
   * The description.
   */
  value: 1 | 2 | 3;
}
