import { TestValidator } from "@nestia/e2e";
import { ILlmSchemaV3 } from "@samchon/openapi";
import { LlmConverterV3 } from "@samchon/openapi/lib/converters/LlmConverterV3";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_schema_oneof = (): void => {
  const app: IJsonSchemaCollection =
    typia.json.schemas<[Circle | Triangle | Rectangle]>();
  const casted: ILlmSchemaV3 | null = LlmConverterV3.schema({
    components: app.components,
    schema: app.schemas[0],
    config: {
      recursive: false,
      constraint: true,
    },
  });
  TestValidator.equals("oneOf")(casted)({
    oneOf: [
      {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["circle"],
          },
          radius: {
            type: "number",
          },
        },
        additionalProperties: false,
        required: ["type", "radius"],
      },
      {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["triangle"],
          },
          base: {
            type: "number",
          },
          height: {
            type: "number",
          },
        },
        additionalProperties: false,
        required: ["type", "base", "height"],
      },
      {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["square"],
          },
          width: {
            type: "number",
          },
          height: {
            type: "number",
          },
        },
        additionalProperties: false,
        required: ["type", "width", "height"],
      },
    ],
    ...{ discriminator: undefined },
  });
};

interface Circle {
  type: "circle";
  radius: number;
}
interface Triangle {
  type: "triangle";
  base: number;
  height: number;
}
interface Rectangle {
  type: "square";
  width: number;
  height: number;
}
