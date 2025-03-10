import fs from "fs";

import { TestGlobal } from "../TestGlobal";
import { ChatGptFunctionCaller } from "../utils/ChatGptFunctionCaller";
import { ShoppingSalePrompt } from "../utils/ShoppingSalePrompt";

const main = async (): Promise<void> => {
  const trials: number[] = await Promise.all(
    new Array(100).fill(0).map(async () => {
      const counter = { value: 0 };
      await ChatGptFunctionCaller.test({
        config: {
          reference: process.argv.includes("--reference"),
        },
        ...ShoppingSalePrompt.schema(),
        texts: await ShoppingSalePrompt.texts(),
        handleParameters: async (parameters) => {
          if (process.argv.includes("--file"))
            fs.promises.writeFile(
              `${TestGlobal.ROOT}/examples/function-calling/schemas/chatgpt.sale.schema.json`,
              JSON.stringify(parameters, null, 2),
              "utf8",
            );
        },
        handleCompletion: async () => {},
        counter,
        model: "gpt-4o",
      });
      return counter.value;
    }),
  );
  console.log(trials);
};
main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
