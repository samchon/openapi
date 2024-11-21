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
import typia, { IJsonSchemaCollection, tags } from "typia";

import { TestGlobal } from "../../../TestGlobal";

export const test_llm_function_calling_gemini_example =
  async (): Promise<void> => {
    if (TestGlobal.env.GEMINI_API_KEY === undefined) return;

    const collection: IJsonSchemaCollection =
      typia.json.schemas<[{ input: IPerson }]>();
    const parameters: IGeminiSchema.IParameters | null =
      GeminiConverter.parameters({
        components: collection.components,
        schema: typia.assert<OpenApi.IJsonSchema.IObject>(
          collection.schemas[0],
        ),
        recursive: false,
      });
    if (parameters === null)
      throw new Error(
        "Failed to convert the JSON schema to the ChatGPT schema.",
      );
    await fs.promises.writeFile(
      `${TestGlobal.ROOT}/examples/function-calling/schemas/gemini.example.schema.json`,
      JSON.stringify(parameters, null, 2),
      "utf8",
    );

    const model: GenerativeModel = new GoogleGenerativeAI(
      TestGlobal.env.GEMINI_API_KEY,
    ).getGenerativeModel({
      model: "gemini-1.5-pro",
    });
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
          role: "user",
          parts: [
            {
              text: USER_MESSAGE,
            },
          ],
        },
      ],
      tools: [
        {
          functionDeclarations: [
            {
              name: "enrollPerson",
              description:
                "Enroll a person to the restaurant reservation list.",
              parameters: parameters as any,
            },
          ],
        },
      ],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingMode.ANY,
          allowedFunctionNames: ["enrollPerson"],
        },
      },
    });

    await ArrayUtil.asyncMap(result.response.functionCalls() ?? [])(
      async (call: FunctionCall) => {
        TestValidator.equals("name")(call.name)("enrollPerson");
        const { input } = typia.assert<{
          input: IPerson;
        }>(call.args);
        await fs.promises.writeFile(
          `${TestGlobal.ROOT}/examples/function-calling/arguments/gemini.example.input.json`,
          JSON.stringify(input, null, 2),
          "utf8",
        );
      },
    );
  };

interface IPerson {
  name: string & tags.Example<"John Doe">;
  age: number & tags.Example<42>;
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const USER_MESSAGE =
  "Just enroll a person whose name and age values exactly same with the example values.";
