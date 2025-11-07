import { ILlmApplication, ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";
import { ShoppingSalePrompt } from "../../../utils/ShoppingSalePrompt";

export const test_chatgpt_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "openai/gpt-4.1",
    application: typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "chatgpt"
    >(),
  });

export const test_claude_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "anthropic/claude-sonnet-4.5",
    application: typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "claude"
    >(),
  });

export const test_deepseek_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "deepseek/deepseek-v3.1-terminus:exacto",
    application: typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "claude"
    >(),
  });

export const test_gemini_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "google/gemini-2.5-pro",
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
      "claude"
    >(),
  });

export const test_qwen_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "qwen/qwen3-next-80b-a3b-instruct",
    application: typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "claude"
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
