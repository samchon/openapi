import { TestValidator } from "@nestia/e2e";
import { IChatGptSchema } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_schema_ref = (): void => {
  test(typia.json.schemas<[IShoppingCategory]>(), {
    schema: {
      $ref: "#/$defs/IShoppingCategory",
    },
    $defs: {
      IShoppingCategory: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          name: {
            type: "string",
          },
          children: {
            type: "array",
            items: {
              $ref: "#/$defs/IShoppingCategory",
            },
          },
        },
        additionalProperties: false,
        required: ["id", "name", "children"],
      },
    },
  });
  test(typia.json.schemas<[IShoppingCategory.IInvert]>(), {
    schema: {
      $ref: "#/$defs/IShoppingCategory.IInvert",
    },
    $defs: {
      "IShoppingCategory.IInvert": {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          name: {
            type: "string",
          },
          parent: {
            anyOf: [
              {
                type: "null",
              },
              {
                $ref: "#/$defs/IShoppingCategory.IInvert",
              },
            ],
          },
        },
        required: ["id", "name", "parent"],
        additionalProperties: false,
      },
    },
  });
};

const test = (
  collection: IJsonSchemaCollection,
  expected: {
    schema: IChatGptSchema;
    $defs: Record<string, IChatGptSchema>;
  },
): void => {
  const $defs: Record<string, IChatGptSchema> = {};
  const schema: IChatGptSchema | null = ChatGptConverter.schema({
    $defs,
    components: collection.components,
    schema: collection.schemas[0],
  });
  TestValidator.equals("ref")(expected)({
    $defs,
    schema: schema!,
  });
};

interface IShoppingCategory {
  id: string & tags.Format<"uuid">;
  name: string;
  children: IShoppingCategory[];
}
namespace IShoppingCategory {
  export interface IInvert {
    id: string & tags.Format<"uuid">;
    name: string;
    parent: IShoppingCategory.IInvert | null;
  }
}
