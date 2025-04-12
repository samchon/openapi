import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";
import { LlmFunctionCaller } from "../utils/LlmFunctionCaller";
import { ShoppingSalePrompt } from "../utils/ShoppingSalePrompt";
import { StopWatch } from "../utils/StopWatch";

const VENDORS = [
  [
    "openai/gpt-4o",
    typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "chatgpt",
      { reference: true }
    >(),
  ],
  [
    "anthropic/claude-3.5-sonnet",
    typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "claude",
      { reference: true }
    >(),
  ],
  [
    "deepseek/deepseek-chat-v3",
    typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "deepseek",
      { reference: true }
    >(),
  ],
  [
    "google/gemini-pro-1.5",
    typia.llm.application<ShoppingSalePrompt.IApplication, "gemini">(),
  ],
  [
    "meta-llama/llama-3.3-70b-instruct",
    typia.llm.application<
      ShoppingSalePrompt.IApplication,
      "llama",
      { reference: true }
    >(),
  ],
] as const;

const main = async (): Promise<void> => {
  for (const title of await ShoppingSalePrompt.documents())
    for (const [vendor, application] of VENDORS)
      try {
        await StopWatch.trace(`${title} - ${application.model}`)(async () =>
          LlmFunctionCaller.test({
            vendor,
            model: application.model,
            function: application.functions[0],
            texts: await ShoppingSalePrompt.texts(title),
            handleCompletion: async (input) => {
              await fs.promises.writeFile(
                `${TestGlobal.ROOT}/examples/function-calling/arguments/${application.model}.${title}.input.json`,
                JSON.stringify(input, null, 2),
                "utf8",
              );
            },
          }),
        );
      } catch (error) {
        console.log(title, " -> Error");
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${application.model}.${title}.error.json`,
          JSON.stringify(
            typia.is<object>(error) ? { ...error } : error,
            null,
            2,
          ),
          "utf8",
        );
      }
};
main().catch((error) => {
  console.log(error);
  process.exit(-1);
});
