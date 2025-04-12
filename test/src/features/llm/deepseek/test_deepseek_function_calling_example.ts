import fs from "fs";
import typia, { tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { DeepSeekFunctionCaller } from "../../../utils/DeepSeekFunctionCaller";

export const test_deepseek_function_calling_example = () =>
  DeepSeekFunctionCaller.test({
    model: (TestGlobal.getArguments("model")[0] as any) ?? "deepseek",
    name: "enrollPerson",
    description: "Enroll a person to the restaurant reservation list.",
    collection: typia.json.schemas<[{ input: IPerson }]>(),
    validate: typia.createValidate<{ input: IPerson }>(),
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
        fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/schemas/deepseek.example.schema.json`,
          JSON.stringify(parameters, null, 2),
          "utf8",
        );
    },
    handleCompletion: async (input) => {
      typia.assert<IPerson>(input);
      if (process.argv.includes("--file"))
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/deepseek.example.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
    },
  });

interface IPerson {
  name: string & tags.Example<"John Doe">;
  age: number & tags.Example<42>;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE =
  "Just enroll a person whose name and age values exactly same with the example values.";
