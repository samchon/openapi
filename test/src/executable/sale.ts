import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";
import { LlmFunctionCaller } from "../utils/LlmFunctionCaller";
import { ShoppingSalePrompt } from "../utils/ShoppingSalePrompt";
import { StopWatch } from "../utils/StopWatch";

const VENDORS = [
  [
    "openai/gpt-4.1",
    typia.llm.application<ShoppingSalePrompt.IApplication, "chatgpt">(),
  ],
  [
    "anthropic/claude-sonnet-4.5",
    typia.llm.application<ShoppingSalePrompt.IApplication, "claude">(),
  ],
  [
    "deepseek/deepseek-v3.1-terminus:exacto",
    typia.llm.application<ShoppingSalePrompt.IApplication, "claude">(),
  ],
  [
    "google/gemini-2.5-pro",
    typia.llm.application<ShoppingSalePrompt.IApplication, "gemini">(),
  ],
  [
    "meta-llama/llama-3.3-70b-instruct",
    typia.llm.application<ShoppingSalePrompt.IApplication, "claude">(),
  ],
  [
    "qwen/qwen3-next-80b-a3b-instruct",
    typia.llm.application<ShoppingSalePrompt.IApplication, "claude">(),
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
            function: application.functions[0] as any,
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
