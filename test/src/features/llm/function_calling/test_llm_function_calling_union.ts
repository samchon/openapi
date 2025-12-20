import { ILlmApplication } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_llm_function_calling_union = () =>
  validate_llm_function_calling_union({
    vendor: "anthropic/claude-sonnet-4.5",
  });

const validate_llm_function_calling_union = async (props: {
  vendor: string;
}) => {
  const application: ILlmApplication = LlmApplicationFactory.convert({
    application: typia.json.application<IApplication>(),
  });
  return await LlmFunctionCaller.test({
    vendor: props.vendor,
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/llm.union.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/llm.union.input.json`,
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
