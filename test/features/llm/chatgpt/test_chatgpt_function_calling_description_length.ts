import typia from "typia";

import { ChatGptFunctionCaller } from "../../../utils/ChatGptFunctionCaller";

export const test_chatgpt_function_calling_description_length = async () => {
  await ChatGptFunctionCaller.test({
    config: {
      reference: true,
    },
    name: "testLength",
    description: "가".repeat(1_024),
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
    handleCompletion: async (input) => {
      typia.assert<IPerson>(input);
    },
  });
};

interface IPerson {
  name: string;
  age: number;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE =
  "Just enroll a person whose name and age values 'John Doe' and 42 years old.";
