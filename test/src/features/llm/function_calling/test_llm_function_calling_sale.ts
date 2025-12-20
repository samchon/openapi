import { ILlmApplication } from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";
import { ShoppingSalePrompt } from "../../../utils/ShoppingSalePrompt";

export const test_llm_function_calling_sale = () =>
  validate_llm_function_calling_sale({
    vendor: "anthropic/claude-sonnet-4.5",
  });

const validate_llm_function_calling_sale = async (props: {
  vendor: string;
}) => {
  const application: ILlmApplication = LlmApplicationFactory.convert({
    application: typia.json.application<ShoppingSalePrompt.IApplication>(),
  });
  return await LlmFunctionCaller.test({
    vendor: props.vendor,
    function: application.functions[0],
    texts: await ShoppingSalePrompt.texts(),
    handleParameters: async (parameters) => {
      if (process.argv.includes("--file"))
        fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/schemas/llm.sale.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/llm.sale.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });
};
