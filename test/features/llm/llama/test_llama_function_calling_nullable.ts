import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlamaFunctionCaller } from "../../../utils/LlamaFunctionCaller";

export const test_llama_function_calling_nullable = () =>
  LlamaFunctionCaller.test({
    model: (TestGlobal.getArguments("model")[0] as any) ?? "llama",
    config: {
      reference: false,
    },
    name: "drawPolygon",
    description: "Draw a polygon with given geometry.",
    collection: typia.json.schemas<[{ input: IPolygon }]>(),
    validate: typia.createValidate<{ input: IPolygon }>(),
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/llama.nullable.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      typia.assert<IPolygon>(input);
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/llama.nullable.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });

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
