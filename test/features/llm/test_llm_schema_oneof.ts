import { TestValidator } from "@nestia/e2e";
import { HttpLlm, ILlmSchema } from "@samchon/openapi";
import typia, { IJsonApplication } from "typia";

export const test_llm_schema_oneof = (): void => {
  const app: IJsonApplication =
    typia.json.application<[Circle | Triangle | Rectangle]>();
  const casted: ILlmSchema | null = HttpLlm.schema({
    components: app.components,
    schema: app.schemas[0],
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
