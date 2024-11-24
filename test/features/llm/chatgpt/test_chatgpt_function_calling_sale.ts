import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { IShoppingSale } from "../../../structures/IShoppingSale";
import { ChatGptFunctionCaller } from "../../../utils/ChatGptFunctionCaller";
import { ShoppingSalePrompt } from "../../../utils/ShoppingSalePrompt";

export const test_chatgpt_function_calling_sale = async (): Promise<void> =>
  ChatGptFunctionCaller.test({
    config: {
      reference: process.argv.includes("--reference"),
      constraint: process.argv.includes("--constraint"),
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
    handleCompletion: async (input) => {
      typia.assert<IShoppingSale.ICreate>(input);
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.sale.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });
