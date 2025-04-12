import { TestValidator } from "@nestia/e2e";
import {
  HttpLlm,
  IHttpLlmApplication,
  ILlmSchema,
  OpenApi,
} from "@samchon/openapi";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_application_mismatch = (): void =>
  validate_llm_application_mismatch("chatgpt");

export const test_claude_application_mismatch = (): void =>
  validate_llm_application_mismatch("claude");

export const test_deepseek_application_mismatch = (): void =>
  validate_llm_application_mismatch("deepseek");

export const test_gemini_application_mismatch = (): void =>
  validate_llm_application_mismatch("gemini");

export const test_llama_application_mismatch = (): void =>
  validate_llm_application_mismatch("llama");

export const test_llm_v30_application_mismatch = (): void =>
  validate_llm_application_mismatch("3.0");

export const test_llm_v31_application_mismatch = (): void =>
  validate_llm_application_mismatch("3.1");

const validate_llm_application_mismatch = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<[IPoint, ICircle, IRectangle]>();
  collection.schemas[0] = { $ref: "#/components/schemas/IPoint1" };
  collection.schemas[1] = { $ref: "#/components/schemas/ICircle1" };
  collection.schemas[2] = { $ref: "#/components/schemas/IRectangle1" };

  const document: OpenApi.IDocument = {
    openapi: "3.1.0",
    components: collection.components,
    paths: {
      "/point": {
        post: {
          requestBody: {
            content: {
              "application/json": {
                schema: collection.schemas[0],
              },
            },
          },
        },
      },
      "/circle": {
        post: {
          requestBody: {
            content: {
              "application/json": {
                schema: collection.schemas[1],
              },
            },
          },
        },
      },
      "/rectangle": {
        post: {
          requestBody: {
            content: {
              "application/json": {
                schema: collection.schemas[2],
              },
            },
          },
        },
      },
    },
    "x-samchon-emended-v4": true,
  };

  const app: IHttpLlmApplication<Model> = HttpLlm.application({
    model,
    document,
  });
  TestValidator.equals("#success")(app.functions.length)(0);
  TestValidator.equals("#errors")(app.errors.length)(3);
  TestValidator.equals("accessors")(
    app.errors
      .map((error) => error.messages.map((m) => m.split(":")[0]))
      .flat()
      .sort(),
  )(
    Object.keys(document.paths ?? {})
      .map(
        (path) =>
          `$input.paths[${JSON.stringify(path)}]["post"].requestBody.content["application/json"].schema`,
      )
      .sort(),
  );
};

interface IPoint {
  x: number;
  y: number;
}
interface ICircle {
  radius: number;
  center: IPoint;
}
interface IRectangle {
  p1: IPoint;
  p2: IPoint;
}
