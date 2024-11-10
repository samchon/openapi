import { TestValidator } from "@nestia/e2e";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";

export const test_chatgpt_schema_recursive_array = (): void => {
  const schema = ChatGptConverter.schema({
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
  });
  TestValidator.equals("recursive")(schema)({
    $ref: "#/$defs/Department",
    $defs: {
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
    },
  });
};
