import { TestValidator } from "@nestia/e2e";
import { HttpLlm, ILlmSchemaV3 } from "@samchon/openapi";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_llm_schema_object = (): void => {
  const app: IJsonSchemaCollection = typia.json.schemas<[First]>();
  const schema: ILlmSchemaV3 | null = HttpLlm.schema({
    model: "3.0",
    components: app.components,
    schema: app.schemas[0],
    recursive: false,
  });
  TestValidator.equals("schema")(schema)({
    type: "object",
    required: ["second"],
    properties: {
      second: {
        type: "object",
        required: ["third"],
        description: "The second property",
        properties: {
          third: {
            type: "object",
            required: ["id"],
            description: "The third property",
            properties: {
              id: {
                type: "string",
                format: "uuid",
                description: "Hello word",
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  });
};

interface First {
  /**
   * The second property
   */
  second: Second;
}
interface Second {
  /**
   * The third property
   */
  third: Third;
}
interface Third {
  /**
   * Hello word
   */
  id: string & tags.Format<"uuid">;
}
