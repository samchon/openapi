import { ILlmApplication, ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_chatgpt_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "openai/gpt-4.1",
    model: "chatgpt",
  });

export const test_claude_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "anthropic/claude-sonnet-4.5",
    model: "claude",
  });

export const test_deepseek_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "deepseek/deepseek-v3.1-terminus:exacto",
    model: "claude",
  });

export const test_gemini_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "google/gemini-2.5-pro",
    model: "gemini",
  });

export const test_llama_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "meta-llama/llama-3.3-70b-instruct",
    model: "claude",
  });

export const test_qwen_function_calling_example = () =>
  validate_llm_function_calling_example({
    vendor: "qwen/qwen3-next-80b-a3b-instruct",
    model: "claude",
  });

const validate_llm_function_calling_example = async <
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
          `${TestGlobal.ROOT}/examples/function-calling/schemas/${props.model}.example.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${props.model}.example.input.json`,
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
  /**
   * Person's actual name.
   *
   * It must not be nickname, but real full name of the citizenship.
   *
   * @title Person Name
   */
  name: string & tags.Example<"John Doe">;

  /**
   * Person's age.
   *
   * It must be an integer number between 0 and 120.
   *
   * @title Person Age
   */
  age: number & tags.Example<42>;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE =
  "Just enroll a person whose name and age values exactly same with the example values.";
