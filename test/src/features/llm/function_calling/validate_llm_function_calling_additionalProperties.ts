import { ILlmApplication, ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_chatgpt_function_calling_additionalProperties = () =>
  validate_llm_function_calling_additionalProperties({
    vendor: "openai/gpt-4o",
    application: typia.llm.application<IApplication, "chatgpt">(),
  });

export const test_claude_function_calling_additionalProperties = () =>
  validate_llm_function_calling_additionalProperties({
    vendor: "anthropic/claude-3.5-sonnet",
    application: typia.llm.application<IApplication, "claude">(),
  });

export const test_deepseek_function_calling_additionalProperties = () =>
  validate_llm_function_calling_additionalProperties({
    vendor: "deepseek/deepseek-chat-v3",
    application: typia.llm.application<IApplication, "deepseek">(),
  });

export const test_llama_function_calling_additionalProperties = () =>
  validate_llm_function_calling_additionalProperties({
    vendor: "meta-llama/llama-3.3-70b-instruct",
    application: typia.llm.application<IApplication, "llama">(),
  });

const validate_llm_function_calling_additionalProperties = <
  Model extends ILlmSchema.Model,
>(props: {
  vendor: string;
  application: ILlmApplication<Model>;
}) =>
  LlmFunctionCaller.test({
    vendor: props.vendor,
    model: props.application.model,
    function: props.application.functions[0],
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/chatgpt.additionalProperties.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${props.application.model}.additionalProperties.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });

interface IApplication {
  /**
   * Enroll a person to the restaurant reservation list.
   */
  enroll(person: IPerson): void;
}

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
   * Additional information about the person.
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
