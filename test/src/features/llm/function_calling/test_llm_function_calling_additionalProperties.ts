import { ILlmApplication } from "@samchon/openapi";
import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_llm_function_calling_additionalProperties = () =>
  validate_llm_function_calling_additionalProperties({
    vendor: "anthropic/claude-sonnet-4.5",
  });

const validate_llm_function_calling_additionalProperties = async (props: {
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/llm.additionalProperties.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/llm.additionalProperties.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });
};

interface IApplication {
  /** Enroll a person to the restaurant reservation list. */
  enroll(person: IPerson): void;
}

interface IPerson {
  /** The name of the person. */
  name: string;

  /** The age of the person. */
  age: number & tags.Type<"uint32">;

  /** Additional information about the person. */
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
