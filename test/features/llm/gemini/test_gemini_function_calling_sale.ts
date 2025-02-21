import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { IShoppingSale } from "../../../structures/IShoppingSale";
import { GeminiFunctionCaller } from "../../../utils/GeminiFunctionCaller";
import { ShoppingSalePrompt } from "../../../utils/ShoppingSalePrompt";

export const test_gemini_function_calling_sale = async () =>
  GeminiFunctionCaller.test({
    config: {
      recursive: 3,
    },
    ...ShoppingSalePrompt.schema(),
    texts: await ShoppingSalePrompt.texts(),
    handleParameters: async (parameters) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/schemas/gemini.sale.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      typia.assert<IShoppingSale.ICreate>(input);
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/gemini.sale.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });
