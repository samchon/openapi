import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, IOpenApiSchemaError, IResult } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_strict = (): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      {
        id: string;
        name: string;
        hobbies: {
          id: string;
          name: string;
        }[];
      },
    ]
  >();
  const res: IResult<ILlmSchema, IOpenApiSchemaError> =
    LlmSchemaComposer.schema("chatgpt")({
      config: {
        ...LlmSchemaComposer.defaultConfig("chatgpt"),
        strict: true,
      },
      components: collection.components,
      schema: collection.schemas[0],
      $defs: {},
    } as any);
  TestValidator.equals("strict")({
    type: "object",
    additionalProperties: false,
    properties: {
      hobbies: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
        },
      },
    },
  })((res.success ? res.value : null) as any);
};
