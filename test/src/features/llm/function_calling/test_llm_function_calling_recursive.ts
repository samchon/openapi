import { ILlmApplication } from "@samchon/openapi";
import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { LlmApplicationFactory } from "../../../utils/LlmApplicationFactory";
import { LlmFunctionCaller } from "../../../utils/LlmFunctionCaller";

export const test_llm_function_calling_recursive = () =>
  validate_llm_function_calling_recursive({
    vendor: "anthropic/claude-sonnet-4.5",
  });

const validate_llm_function_calling_recursive = async (props: {
  vendor: string;
}) => {
  const application: ILlmApplication = LlmApplicationFactory.convert({
    application: typia.json.application<IApplication>(),
  });
  return await LlmFunctionCaller.test({
    vendor: props.vendor,
    function: application.functions[0],
    texts: [
      {
        role: "assistant",
        content: SYSTEM_MESSAGE,
      },
      {
        role: "user",
        content: USER_MESSAGE,
      },
    ],
    handleParameters: async (parameters) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/schemas/llm.recursive.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/llm.recursive.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });
};

interface IApplication {
  /** Compose categories from the input. */
  commpose(props: IComposeProps): void;
}

interface IComposeProps {
  categories: IShoppingCategory[];
}

interface IShoppingCategory {
  /** Identifier code of the category. */
  code: string & tags.Pattern<"^[a-z0-9_]+$">;

  /** Name of the category. */
  name: string;

  /** Children categories belong to this category. */
  children: IShoppingCategory[];
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE = `
  I'll insert a shopping category tree here.
  
  - electronics
    - desktops
    - laptops
      - ultrabooks
      - macbooks
      - desknotes
      - 2 in 1 laptops
    - tablets
      - ipads
      - android tablets
      - windows tablets
    - smart phones
      - mini smartphones
      - phablets
      - gaming smartphones
      - rugged smartphones
      - foldable smartphones
    - smart watches
    - smart glasses
    - cameras
    - televisions
  - furnitures
  - accessories
    - jewelry
    - clothing
    - shoes
  - clothes
  - others
`;
