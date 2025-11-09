import { ILlmSchema } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";
import { LlmApplicationFactory } from "../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../utils/LlmFunctionCaller";
import { ShoppingSalePrompt } from "../utils/ShoppingSalePrompt";
import { StopWatch } from "../utils/StopWatch";

const VENDORS: Array<[string, ILlmSchema.Model]> = [
  ["openai/gpt-4.1", "chatgpt"],
  ["anthropic/claude-sonnet-4.5", "claude"],
  ["deepseek/deepseek-v3.1-terminus:exacto", "claude"],
  ["google/gemini-2.5-pro", "gemini"],
  ["meta-llama/llama-3.3-70b-instruct", "claude"],
  ["qwen/qwen3-next-80b-a3b-instruct", "claude"],
];

const main = async (): Promise<void> => {
  for (const title of await ShoppingSalePrompt.documents())
    for (const [vendor, model] of VENDORS)
      try {
        const application = LlmApplicationFactory.convert({
          model,
          application: typia.json.application<ShoppingSalePrompt.IApplication>(),
        });
        await StopWatch.trace(`${title} - ${model}`)(async () =>
          LlmFunctionCaller.test({
            vendor,
            model,
            function: application.functions[0] as any,
            texts: await ShoppingSalePrompt.texts(title),
            handleCompletion: async (input) => {
              await fs.promises.writeFile(
                `${TestGlobal.ROOT}/examples/function-calling/arguments/${model}.${title}.input.json`,
                JSON.stringify(input, null, 2),
                "utf8",
              );
            },
          }),
        );
      } catch (error) {
        console.log(title, " -> Error");
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/${model}.${title}.error.json`,
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
