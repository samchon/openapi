import { TestValidator } from "@nestia/e2e";
import { LlmConverterV3_1 } from "@samchon/openapi/lib/converters/LlmConverterV3_1";

export const test_llm_schema_recursive_array = (): void => {
  const schema = LlmConverterV3_1.schema({
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
    recursive: 3,
  });
  TestValidator.equals("recursive")(schema)({
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      children: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            children: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  children: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                        },
                        children: {
                          type: "array",
                          items: {},
                          maxItems: 0,
                        },
                      },
                      required: ["name", "children"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["name", "children"],
                additionalProperties: false,
              },
            },
          },
          required: ["name", "children"],
          additionalProperties: false,
        },
      },
    },
    required: ["name", "children"],
    additionalProperties: false,
  });
};
