import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";
import { LlmApplicationFactory } from "../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../utils/LlmFunctionCaller";
import { ShoppingSalePrompt } from "../utils/ShoppingSalePrompt";
import { StopWatch } from "../utils/StopWatch";

const VENDORS: string[] = [
  "openai/gpt-4.1",
  "anthropic/claude-sonnet-4.5",
  "deepseek/deepseek-v3.1-terminus:exacto",
  "google/gemini-2.5-pro",
  "meta-llama/llama-3.3-70b-instruct",
  "qwen/qwen3-next-80b-a3b-instruct",
];

const main = async (): Promise<void> => {
  for (const title of await ShoppingSalePrompt.documents())
    for (const vendor of VENDORS)
      try {
        const application = LlmApplicationFactory.convert({
          application: typia.json.application<ShoppingSalePrompt.IApplication>(),
        });
        await StopWatch.trace(`${title} - ${vendor}`)(async () =>
          LlmFunctionCaller.test({
            vendor,
            function: application.functions[0] as any,
            texts: await ShoppingSalePrompt.texts(title),
            handleCompletion: async (input) => {
              await fs.promises.writeFile(
                `${TestGlobal.ROOT}/examples/function-calling/arguments/llm.${title}.input.json`,
                JSON.stringify(input, null, 2),
                "utf8",
              );
            },
          }),
        );
      } catch (error) {
        console.log(title, " -> Error");
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/llm.${title}.error.json`,
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
