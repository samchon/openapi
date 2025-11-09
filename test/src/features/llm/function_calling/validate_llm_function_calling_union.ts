import { ILlmApplication, ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_chatgpt_function_calling_union = () =>
  validate_llm_function_calling_union({
    vendor: "openai/gpt-4.1",
    model: "chatgpt",
  });

export const test_claude_function_calling_union = () =>
  validate_llm_function_calling_union({
    vendor: "anthropic/claude-sonnet-4.5",
    model: "claude",
  });

export const test_deepseek_function_calling_union = () =>
  validate_llm_function_calling_union({
    vendor: "deepseek/deepseek-v3.1-terminus:exacto",
    model: "claude",
  });

export const test_gemini_function_calling_union = () =>
  validate_llm_function_calling_union({
    vendor: "google/gemini-2.5-pro",
    model: "gemini",
  });

export const test_llama_function_calling_union = () =>
  validate_llm_function_calling_union({
    vendor: "meta-llama/llama-3.3-70b-instruct",
    model: "claude",
  });

export const test_qwen_function_calling_union = () =>
  validate_llm_function_calling_union({
    vendor: "qwen/qwen3-next-80b-a3b-instruct",
    model: "claude",
  });

const validate_llm_function_calling_union = async <
  Model extends ILlmSchema.Model,
>(props: {
  vendor: string;
  model: Model;
}) => {
  const application: ILlmApplication<Model> =
    LlmApplicationFactory.convert<Model>({
      model: props.model,
      application: typia.json.application<IApplication>(),
    });
  return await LlmFunctionCaller.test({
    vendor: props.vendor,
    model: props.model,
    function: application.functions[0],
    texts: [
      {
        role: "assistant",
        content: SYSTEM_MESSAGE,
      },
      {
        role: "user",
        content: USER_MESSAGE,
      },
    ],
    handleParameters: async (parameters) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/schemas/${props.model}.union.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${props.model}.union.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });
};

interface IApplication {
  /** Draw a shape with following geometry. */
  draw(props: IDrawProps): void;
}
interface IDrawProps {
  shape: IRectangle | ICircle | IPolygon;
}
interface IRectangle {
  type: "rectangle";
  p1: IPoint;
  p2: IPoint;
}
interface ICircle {
  type: "circle";
  radius: number;
  center: IPoint;
}
interface IPolygon {
  type: "polygon";
  inner: IPoint[][] | null;
  outer: IPoint[];
}
interface IPoint {
  x: number;
  y: number;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE = `
  Draw a polygon with given outer points.

  - (0, 0)
  - (0, 10)
  - (10, 10)
  - (10, 0)

  About the inner points, do nothing about it.
`;
