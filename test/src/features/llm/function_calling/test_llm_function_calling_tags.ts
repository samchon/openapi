import { ILlmApplication } from "@samchon/openapi";
import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_llm_function_calling_tags = () =>
  validate_llm_function_calling_tags({
    vendor: "anthropic/claude-sonnet-4.5",
  });

const validate_llm_function_calling_tags = async (props: {
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/llm.tags.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/llm.tags.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });
};

interface IApplication {
  /** Reserve some opening time. */
  reserve(time: IOpeningTime): void;
}

interface IOpeningTime {
  reasons: Array<string> & tags.MinItems<1>;
  temporary: boolean;
  time: (string & tags.Format<"date-time">) | null;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE = `
  Reserve current date-time permenantely as the reason of marketing sales.
`;
