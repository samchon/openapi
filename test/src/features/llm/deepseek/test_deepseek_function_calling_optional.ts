import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { DeepSeekFunctionCaller } from "../../../utils/DeepSeekFunctionCaller";

export const test_deepseek_function_calling_optional = () =>
  DeepSeekFunctionCaller.test({
    model: (TestGlobal.getArguments("model")[0] as any) ?? "chatgpt",
    config: {
      reference: false,
    },
    name: "registerMember",
    description: "Register a membership.",
    collection: typia.json.schemas<[{ input: IMember; note?: string }]>(),
    validate: typia.createValidate<{ input: IMember; note?: string }>(),
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/deepseek.optional.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      typia.assert<IMember>(input);
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/deepseek.optional.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });

/**
 * Membership information.
 */
interface IMember {
  /**
   * Name of the member.
   */
  name: string;

  /**
   * Age of the member.
   */
  age: number;

  /**
   * Hobby of the member.
   */
  hobby?: string;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE =
  "Just enroll a membership whose name is John Doe and age is 30.";
