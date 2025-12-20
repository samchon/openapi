import { ILlmApplication } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_llm_function_calling_optional = () =>
  validate_llm_function_calling_optional({
    vendor: "anthropic/claude-sonnet-4.5",
  });

const validate_llm_function_calling_optional = async (props: {
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/llm.optional.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/llm.optional.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });
};

interface IApplication {
  /** Register a membership. */
  register(member: IMember): void;
}

/** Membership information. */
interface IMember {
  /** Name of the member. */
  name: string;

  /** Age of the member. */
  age: number;

  /** Hobby of the member. */
  hobby?: string;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE =
  "Just enroll a membership whose name is John Doe and age is 30.";
