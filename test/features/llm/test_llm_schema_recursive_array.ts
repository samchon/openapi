import { TestValidator } from "@nestia/e2e";
import { HttpLlmConverter } from "@samchon/openapi/lib/converters/HttpLlmConverter";

export const test_llm_schema_recursive_array = (): void => {
  const schema = HttpLlmConverter.schema({
    components: {
      schemas: {
        Department: {
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
                $ref: "#/components/schemas/Department",
              },
            },
          },
          required: ["id", "name", "children"],
        },
      },
    },
    schema: {
      $ref: "#/components/schemas/Department",
    },
    recursive: 3,
  });
  TestValidator.equals("recursive")(schema)({
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
                          items: {},
                          maxItems: 0,
                        },
                      },
                      required: ["id", "name", "children"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["id", "name", "children"],
                additionalProperties: false,
              },
            },
          },
          required: ["id", "name", "children"],
          additionalProperties: false,
        },
      },
    },
    required: ["id", "name", "children"],
    additionalProperties: false,
  });
};
