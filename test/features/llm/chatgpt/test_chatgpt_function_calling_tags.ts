import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { ChatGptFunctionCaller } from "../../../utils/ChatGptFunctionCaller";

export const test_chatgpt_function_calling_tags = (): Promise<void> =>
  ChatGptFunctionCaller.test({
    config: {
      constraint: false,
      reference: false,
    },
    name: "reserve",
    description: "Reserve some opening time.",
    collection: typia.json.schemas<[{ input: OpeningTime }]>(),
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
    handleParameters: (parameters) =>
      fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/schemas/chatgpt.tags.schema.json`,
        JSON.stringify(parameters, null, 2),
        "utf8",
      ),
    handleCompletion: async (input) => {
      typia.assert<OpeningTime>(input);
      await fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.tags.input.json`,
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
