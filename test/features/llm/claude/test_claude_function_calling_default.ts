import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { ClaudeFunctionCaller } from "../../../utils/ClaudeFunctionCaller";

export const test_claude_function_calling_default = () =>
  ClaudeFunctionCaller.test({
    model: (TestGlobal.getArguments("model")[0] as any) ?? "claude",
    config: {
      reference: true,
    },
    name: "enrollPerson",
    description: "Enroll a person to the restaurant reservation list.",
    collection: typia.json.schemas<[{ input: IPerson }]>(),
    validate: typia.createValidate<{ input: IPerson }>(),
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/claude.default.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      typia.assert<IPerson>(input);
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/claude.default.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });

interface IPerson {
  name: string & tags.Default<"John Doe">;
  age: number & tags.Default<42>;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE =
  "Just enroll a person whose name and age values exactly same with the default values.";
