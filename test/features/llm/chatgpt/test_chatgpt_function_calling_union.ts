import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { ChatGptFunctionCaller } from "../../../utils/ChatGptFunctionCaller";

export const test_chatgpt_function_calling_union = (): Promise<void> =>
  ChatGptFunctionCaller.test({
    config: {
      reference: false,
    },
    name: "draw",
    description: "Draw a shape with following geometry.",
    collection: typia.json.schemas<[{ input: Shape }]>(),
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/chatgpt.union.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      typia.assert<Shape>(input);
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.union.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });

type Shape = IRectangle | ICircle; // | IPolygon;
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
// interface IPolygon {
//   type: "polygon";
//   inner: IPoint[][] | null;
//   outer: IPoint[];
// }
interface IPoint {
  x: number;
  y: number;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

// const USER_MESSAGE = `
//   Draw a polygon with given outer points.

//   - (0, 0)
//   - (0, 10)
//   - (10, 10)
//   - (10, 0)

//   About the inner points, do nothing about it.
// `;

const USER_MESSAGE = `
  Draw a circle with radius 5 and center at (0, 0).
`;
