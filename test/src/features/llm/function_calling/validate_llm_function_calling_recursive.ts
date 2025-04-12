import { ILlmApplication, ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_chatgpt_function_calling_recursive = () =>
  validate_llm_function_calling_recursive({
    vendor: "openai/gpt-4o",
    application: typia.llm.application<IApplication, "chatgpt">(),
  });

export const test_claude_function_calling_recursive = () =>
  validate_llm_function_calling_recursive({
    vendor: "anthropic/claude-3.5-sonnet",
    application: typia.llm.application<IApplication, "claude">(),
  });

export const test_deepseek_function_calling_recursive = () =>
  validate_llm_function_calling_recursive({
    vendor: "deepseek/deepseek-chat-v3",
    application: typia.llm.application<IApplication, "deepseek">(),
  });

export const test_llama_function_calling_recursive = () =>
  validate_llm_function_calling_recursive({
    vendor: "meta-llama/llama-3.3-70b-instruct",
    application: typia.llm.application<IApplication, "llama">(),
  });

const validate_llm_function_calling_recursive = <
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/${props.application.model}.recursive.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${props.application.model}.recursive.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });

interface IApplication {
  /**
   * Compose categories from the input.
   */
  commpose(props: IComposeProps): void;
}

interface IComposeProps {
  categories: IShoppingCategory[];
}

interface IShoppingCategory {
  /**
   * Identifier code of the category.
   */
  code: string & tags.Pattern<"^[a-z0-9_]+$">;

  /**
   * Name of the category.
   */
  name: string;

  /**
   * Children categories belong to this category.
   */
  children: IShoppingCategory[];
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE = `
  I'll insert a shopping category tree here.
  
  - electronics
    - desktops
    - laptops
      - ultrabooks
      - macbooks
      - desknotes
      - 2 in 1 laptops
    - tablets
      - ipads
      - android tablets
      - windows tablets
    - smart phones
      - mini smartphones
      - phablets
      - gaming smartphones
      - rugged smartphones
      - foldable smartphones
    - smart watches
    - smart glasses
    - cameras
    - televisions
  - furnitures
  - accessories
    - jewelry
    - clothing
    - shoes
  - clothes
  - others
`;
