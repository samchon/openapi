import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { ClaudeFunctionCaller } from "../../../utils/ClaudeFunctionCaller";

export const test_claude_function_calling_additionalProperties =
  (): Promise<void> =>
    ClaudeFunctionCaller.test({
      model: "claude",
      name: "enrollPerson",
      description: "Enroll a person to the restaurant reservation list.",
      collection: typia.json.schemas<[{ input: IPerson }]>(),
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
            `${TestGlobal.ROOT}/examples/function-calling/schemas/claude.additionalProperties.schema.json`,
            JSON.stringify(parameters, null, 2),
            "utf8",
          );
      },
      handleCompletion: async (input) => {
        typia.assert<IPerson>(input);
        if (process.argv.includes("--file"))
          await fs.promises.writeFile(
            `${TestGlobal.ROOT}/examples/function-calling/arguments/claude.additionalProperties.input.json`,
            JSON.stringify(input, null, 2),
            "utf8",
          );
      },
    });

interface IPerson {
  /**
   * The name of the person.
   */
  name: string;

  /**
   * The age of the person.
   */
  age: number & tags.Type<"uint32">;

  /**
   * Additional informations about the person.
   */
  etc: Record<string, string>;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE = `
  Just enroll a person with below information:

    - name: John Doe
    - age: 42
    - hobby: Soccer
    - job: Scientist
`;