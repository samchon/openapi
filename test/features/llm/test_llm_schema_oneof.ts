import { TestValidator } from "@nestia/e2e";
import { HttpLlm, ILlmSchemaV3 } from "@samchon/openapi";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_schema_oneof = (): void => {
  const app: IJsonSchemaCollection =
    typia.json.schemas<[Circle | Triangle | Rectangle]>();
  const casted: ILlmSchemaV3 | null = HttpLlm.schema({
    model: "3.0",
    components: app.components,
    schema: app.schemas[0],
    recursive: false,
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
