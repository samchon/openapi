import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { DeepSeekFunctionCaller } from "../../../utils/DeepSeekFunctionCaller";

export const test_deepseek_function_calling_tags = () =>
  DeepSeekFunctionCaller.test({
    model: (TestGlobal.getArguments("model")[0] as any) ?? "chatgpt",
    name: "reserve",
    description: "Reserve some opening time.",
    collection: typia.json.schemas<[{ input: OpeningTime }]>(),
    validate: typia.createValidate<{ input: OpeningTime }>(),
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/deepseek.tags.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      typia.assert<OpeningTime>(input);
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/deepseek.tags.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });

interface OpeningTime {
  reasons: Array<string> & tags.MinItems<1>;
  temporary: boolean;
  time: (string & tags.Format<"date-time">) | null;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE = `
  Reserve current date-time permenantely as the reason of marketing sales.
`;
