import { ILlmApplication, ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";
import { ShoppingSalePrompt } from "../../../utils/ShoppingSalePrompt";

export const test_chatgpt_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "openai/gpt-4o",
    application: typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "chatgpt",
      { reference: true }
    >(),
  });

export const test_claude_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "anthropic/claude-3.5-sonnet",
    application: typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "claude",
      { reference: true }
    >(),
  });

export const test_deepseek_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "deepseek/deepseek-chat-v3",
    application: typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "deepseek",
      { reference: true }
    >(),
  });

export const test_gemini_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "google/gemini-pro-1.5",
    application: typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "gemini"
    >(),
  });

export const test_llama_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "meta-llama/llama-3.3-70b-instruct",
    application: typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "llama",
      { reference: true }
    >(),
  });

const validate_llm_function_calling_sale = async <
  Model extends ILlmSchema.Model,
>(props: {
  vendor: string;
  application: ILlmApplication<Model>;
}) =>
  LlmFunctionCaller.test({
    vendor: props.vendor,
    model: props.application.model,
    function: props.application.functions[0],
    texts: await ShoppingSalePrompt.texts(),
    handleParameters: async (parameters) => {
      if (process.argv.includes("--file"))
        fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/schemas/${props.application.model}.sale.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${props.application.model}.sale.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });
