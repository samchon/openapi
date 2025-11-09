import { ILlmApplication, ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_chatgpt_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "openai/gpt-4.1",
    model: "chatgpt",
  });

export const test_claude_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "anthropic/claude-sonnet-4.5",
    model: "claude",
  });

export const test_deepseek_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "deepseek/deepseek-v3.1-terminus:exacto",
    model: "claude",
  });

export const test_gemini_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "google/gemini-2.5-pro",
    model: "gemini",
  });

export const test_llama_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "meta-llama/llama-3.3-70b-instruct",
    model: "claude",
  });

export const test_qwen_function_calling_optional = () =>
  validate_chatgpt_function_calling_optional({
    vendor: "qwen/qwen3-next-80b-a3b-instruct",
    model: "claude",
  });

const validate_chatgpt_function_calling_optional = async <
  Model extends ILlmSchema.Model,
>(props: {
  vendor: string;
  model: Model;
}) => {
  const application: ILlmApplication<Model> =
    LlmApplicationFactory.convert<Model>({
      model: props.model,
      application: typia.json.application<IApplication>(),
    });
  return await LlmFunctionCaller.test({
    vendor: props.vendor,
    model: props.model,
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/${props.model}.optional.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${props.model}.optional.input.json`,
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
