import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { ClaudeFunctionCaller } from "../../../utils/ClaudeFunctionCaller";

export const test_claude_function_calling_optional = () =>
  ClaudeFunctionCaller.test({
    model: "claude",
    config: {
      reference: true,
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/claude.optional.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      typia.assert<IMember>(input);
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/claude.optional.input.json`,
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
