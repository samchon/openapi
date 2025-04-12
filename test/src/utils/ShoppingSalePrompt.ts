import fs from "fs";
import typia from "typia";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../dto/ILlmTextPrompt";
import { IShoppingSale } from "../dto/IShoppingSale";

export namespace ShoppingSalePrompt {
  export const documents = async (): Promise<string[]> => {
    const directory: string[] = await fs.promises.readdir(
      `${TestGlobal.ROOT}/examples/function-calling/prompts`,
    );
    return directory
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.substring(0, file.length - 3));
  };

  export const schema = () => ({
    name: "createSale",
    description: "Create a sale and returns the detailed information.",
    collection:
      typia.json.schemas<[{ input: IShoppingSale.ICreate }, IShoppingSale]>(),
    validate: typia.createValidate<IShoppingSale.ICreate>(),
  });

  export const texts = async (
    product: string = "microsoft-surface-pro-9",
  ): Promise<ILlmTextPrompt[]> => [
    {
      role: "assistant",
      content: SYSTEM_MESSAGE,
    },
    {
      role: "assistant",
      content: [
        "Here is the list of categories belonged to the samchon channel",
        "",
        "```json",
        await fs.promises.readFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/claude.recursive.input.json`,
          "utf8",
        ),
        "```",
      ].join("\n"),
    },
    {
      role: "user",
      content: await fs.promises.readFile(
        `${TestGlobal.ROOT}/examples/function-calling/prompts/${product}.md`,
        "utf8",
      ),
    },
  ];
}

const SYSTEM_MESSAGE = [
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.",
  "",
  "When you use tool calling, DO NOT RETURN AN EMPTY OBJECT FOR THE TOOL. Check the input schema carefully and return the correct object.",
  "",
  "example:",
  "❌ { input: undefined }",
  "✅ { input: { message: 'hello' } }",
  "",
  "When you cannot find data for some properties, return null instead of an empty string, undefined, or nothing.",
  "When the property is optional, you can return null.",
  "When the property is array and no information is available, return an empty array. However check out the minimun/maximum length of the array",
  "",
  "example:",
  "❌ { input: { a: '' } } // b and c are missing",
  "✅ { input: { a: '', b: null, c: [] } } // b and c are optional",
].join("\n");
