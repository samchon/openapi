import { TestValidator } from "@nestia/e2e";
import { IChatGptSchema } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";

export const test_chatgpt_schema_recursive_array = (): void => {
  const $defs: Record<string, IChatGptSchema> = {};
  const schema = ChatGptConverter.schema({
    $defs,
    components: {
      schemas: {
        Department: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            children: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Department",
              },
            },
          },
          required: ["name", "children"],
        },
      },
    },
    schema: {
      $ref: "#/components/schemas/Department",
    },
    options: {
      constraint: true,
      reference: false,
    },
  });
  TestValidator.equals("$defs")($defs)({
    Department: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        children: {
          type: "array",
          items: {
            $ref: "#/$defs/Department",
          },
        },
      },
      required: ["name", "children"],
      additionalProperties: false,
    },
  });
  TestValidator.equals("schema")(schema)({
    $ref: "#/$defs/Department",
  });
};
