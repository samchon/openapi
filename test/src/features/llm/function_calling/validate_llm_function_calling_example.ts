import { ILlmApplication, ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_chatgpt_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "openai/gpt-4o",
    application: typia.llm.application<IApplication, "chatgpt">(),
  });

export const test_claude_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "anthropic/claude-3.5-sonnet",
    application: typia.llm.application<IApplication, "claude">(),
  });

export const test_deepseek_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "deepseek/deepseek-chat-v3",
    application: typia.llm.application<IApplication, "deepseek">(),
  });

export const test_gemini_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "google/gemini-pro-1.5",
    application: typia.llm.application<IApplication, "gemini">(),
  });

export const test_llama_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "meta-llama/llama-3.3-70b-instruct",
    application: typia.llm.application<IApplication, "llama">(),
  });

const validate_llm_function_calling_example = <
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/${props.application.model}.example.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${props.application.model}.example.input.json`,
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
  name: string & tags.Example<"John Doe">;
  age: number & tags.Example<42>;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE =
  "Just enroll a person whose name and age values exactly same with the example values.";
