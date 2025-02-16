import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { IShoppingSale } from "../../../structures/IShoppingSale";
import { DeepSeekFunctionCaller } from "../../../utils/DeepSeekFunctionCaller";
import { ShoppingSalePrompt } from "../../../utils/ShoppingSalePrompt";

export const test_deepseek_function_calling_sale = async (): Promise<void> =>
  DeepSeekFunctionCaller.test({
    model: (TestGlobal.getArguments("model")[0] as any) ?? "chatgpt",
    ...ShoppingSalePrompt.schema(),
    texts: await ShoppingSalePrompt.texts(),
    handleParameters: (parameters) =>
      fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/schemas/deepseek.sale.schema.json`,
        JSON.stringify(parameters, null, 2),
        "utf8",
      ),
    handleCompletion: async (input) => {
      typia.assert<IShoppingSale.ICreate>(input);
      await fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/arguments/deepseek.sale.input.json`,
        JSON.stringify(input, null, 2),
        "utf8",
      );
    },
  });
