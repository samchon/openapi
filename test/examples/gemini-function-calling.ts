import {
  FunctionCall,
  FunctionCallingMode,
  GenerateContentResult,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { ArrayUtil, TestValidator } from "@nestia/e2e";
import { IGeminiSchema, OpenApi } from "@samchon/openapi";
import { GeminiConverter } from "@samchon/openapi/lib/converters/GeminiConverter";
import fs from "fs";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../TestGlobal";
import { IShoppingSale } from "../structures/IShoppingSale";

const main = async (): Promise<void> => {
  if (TestGlobal.env.GEMINI_API_KEY === undefined) return;

  const collection: IJsonSchemaCollection =
    typia.json.schemas<[{ input: IShoppingSale.ICreate }, IShoppingSale]>();
  const parameters: IGeminiSchema.IParameters | null =
    GeminiConverter.parameters({
      components: collection.components,
      schema: typia.assert<OpenApi.IJsonSchema.IObject>(collection.schemas[0]),
      config: {
        recursive: 3,
      },
    });
  if (parameters === null)
    throw new Error("Failed to convert the JSON schema to the Gemini schema.");

  const directory: string[] = await fs.promises.readdir(
    `${TestGlobal.ROOT}/examples/function-calling/prompts`,
  );
  for (const file of directory) {
    if (file.endsWith(".md") === false) continue;

    const title: string = file.substring(0, file.length - 3);
    if (
      process.argv.includes("--include") &&
      process.argv.every((v) => title.includes(v) === false)
    )
      continue;
    console.log(title);

    const content: string = await fs.promises.readFile(
      `${TestGlobal.ROOT}/examples/function-calling/prompts/${file}`,
      "utf8",
    );
    const model: GenerativeModel = new GoogleGenerativeAI(
      TestGlobal.env.GEMINI_API_KEY,
    ).getGenerativeModel({
      model: "gemini-1.5-pro",
    });
    try {
      const result: GenerateContentResult = await model.generateContent({
        contents: [
          {
            role: "model",
            parts: [
              {
                text: SYSTEM_MESSAGE,
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: [
                  "Here is the list of categories belonged to the samchon channel",
                  "",
                  "```json",
                  await fs.promises.readFile(
                    `${TestGlobal.ROOT}/examples/function-calling/arguments/chatgpt.recursive.input.json`,
                    "utf8",
                  ),
                  "```",
                ].join("\n"),
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text: content,
              },
            ],
          },
        ],
        tools: [
          {
            functionDeclarations: [
              {
                name: "createSale",
                description:
                  "Create a sale and returns the detailed information.",
                parameters: parameters as any,
              },
            ],
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingMode.ANY,
            allowedFunctionNames: ["createSale"],
          },
        },
      });
      await ArrayUtil.asyncMap(result.response.functionCalls() ?? [])(
        async (call: FunctionCall) => {
          TestValidator.equals("name")(call.name)("createSale");
          const { input } = typia.assert<{
            input: IShoppingSale.ICreate;
          }>(call.args);
          await fs.promises.writeFile(
            `${TestGlobal.ROOT}/examples/function-calling/arguments/gemini.sale.input.${title}.json`,
            JSON.stringify(input, null, 2),
            "utf8",
          );
        },
      );
    } catch (error) {
      await fs.promises.writeFile(
        `${TestGlobal.ROOT}/examples/function-calling/arguments/gemini.sale.error.${title}.json`,
        JSON.stringify(typia.is<object>(error) ? { ...error } : error, null, 2),
        "utf8",
      );
    }
  }
};
main().catch((error) => {
  console.log(error);
  process.exit(-1);
});

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";
