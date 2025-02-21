import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { IShoppingSale } from "../../../structures/IShoppingSale";
import { ClaudeFunctionCaller } from "../../../utils/ClaudeFunctionCaller";
import { ShoppingSalePrompt } from "../../../utils/ShoppingSalePrompt";

export const test_claude_function_calling_sale = async () =>
  ClaudeFunctionCaller.test({
    model: (TestGlobal.getArguments("model")[0] as any) ?? "claude",
    config: {
      reference: process.argv.includes("--reference"),
    },
    ...ShoppingSalePrompt.schema(),
    texts: await ShoppingSalePrompt.texts(),
    handleParameters: (parameters) =>
      fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/schemas/claude.sale.schema.json`,
        JSON.stringify(parameters, null, 2),
        "utf8",
      ),
    handleCompletion: async (input) => {
      typia.assert<IShoppingSale.ICreate>(input);
      await fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/arguments/claude.sale.input.json`,
        JSON.stringify(input, null, 2),
        "utf8",
      );
    },
  });
