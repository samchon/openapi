import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";
import { ChatGptFunctionCaller } from "../utils/ChatGptFunctionCaller";
import { ShoppingSalePrompt } from "../utils/ShoppingSalePrompt";
import { StopWatch } from "../utils/StopWatch";

const main = async (): Promise<void> => {
  for (const title of await ShoppingSalePrompt.documents()) {
    if (
      process.argv.includes("--include") &&
      process.argv.every((v) => title.includes(v) === false)
    )
      continue;
    try {
      await StopWatch.trace(title)(async () =>
        ChatGptFunctionCaller.test({
          config: {
            reference: process.argv.includes("--reference"),
          },
          ...ShoppingSalePrompt.schema(),
          texts: await ShoppingSalePrompt.texts(title),
          handleCompletion: async (input) => {
            await fs.promises.writeFile(
              `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.${title}.input.json`,
              JSON.stringify(input, null, 2),
              "utf8",
            );
          },
        }),
      );
    } catch (error) {
      console.log(title, " -> Error");
      await fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.${title}.error.json`,
        JSON.stringify(typia.is<object>(error) ? { ...error } : error, null, 2),
        "utf8",
      );
    }
  }
};
main().catch((error) => {
  console.log(error);
  process.exit(-1);
});
