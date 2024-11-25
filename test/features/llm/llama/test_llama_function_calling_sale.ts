import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { IShoppingSale } from "../../../structures/IShoppingSale";
import { LlamaFunctionCaller } from "../../../utils/LlamaFunctionCaller";
import { ShoppingSalePrompt } from "../../../utils/ShoppingSalePrompt";

export const test_llama_function_calling_sale = async (): Promise<void> =>
  LlamaFunctionCaller.test({
    model: (TestGlobal.getArguments("model")[0] as any) ?? "llama",
    ...ShoppingSalePrompt.schema(),
    texts: await ShoppingSalePrompt.texts(),
    handleParameters: (parameters) =>
      fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/schemas/llama.sale.schema.json`,
        JSON.stringify(parameters, null, 2),
        "utf8",
      ),
    handleCompletion: async (input) => {
      typia.assert<IShoppingSale.ICreate>(input);
      await fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/arguments/llama.sale.input.json`,
        JSON.stringify(input, null, 2),
        "utf8",
      );
    },
  });
