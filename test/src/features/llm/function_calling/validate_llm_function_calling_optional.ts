import { ILlmApplication, ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_chatgpt_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "openai/gpt-4o",
    application: typia.llm.application<IApplication, "chatgpt">(),
  });

export const test_claude_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "anthropic/claude-3.5-sonnet",
    application: typia.llm.application<IApplication, "claude">(),
  });

export const test_deepseek_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "deepseek/deepseek-chat-v3",
    application: typia.llm.application<IApplication, "deepseek">(),
  });

export const test_gemini_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "google/gemini-pro-1.5",
    application: typia.llm.application<IApplication, "gemini">(),
  });

export const test_llama_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "meta-llama/llama-3.3-70b-instruct",
    application: typia.llm.application<IApplication, "llama">(),
  });

const validate_chatgpt_function_calling_optional = <
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/${props.application.model}.optional.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${props.application.model}.optional.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });

interface IApplication {
  /**
   * Register a membership.
   */
  register(member: IMember): void;
}

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
