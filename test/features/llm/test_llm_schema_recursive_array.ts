import { TestValidator } from "@nestia/e2e";
import { LlmConverterV3 } from "@samchon/openapi/lib/converters/LlmConverterV3";

export const test_llm_schema_recursive_array = (): void => {
  const schema = LlmConverterV3.schema({
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
    config: {
      recursive: 3,
      constraint: true,
    },
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
