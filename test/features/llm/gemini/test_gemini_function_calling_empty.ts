import {
  FunctionCallingMode,
  GenerateContentResult,
  GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { TestValidator } from "@nestia/e2e";

import { TestGlobal } from "../../../TestGlobal";

export const test_gemini_function_calling_empty = async () => {
  if (TestGlobal.env.GEMINI_API_KEY === undefined) return false;

  const model: GenerativeModel = new GoogleGenerativeAI(
    TestGlobal.env.GEMINI_API_KEY,
  ).getGenerativeModel({
    model: "gemini-1.5-pro",
  });
  const completion: GenerateContentResult = await model.generateContent({
    contents: [
      {
        role: "model",
        parts: [
          {
            text: "You are a helpful customer support assistant. Use the supplied tools to assist the user.",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Call a print function please.",
          },
        ],
      },
    ],
    tools: [
      {
        functionDeclarations: [
          {
            name: "print",
            description: "Print to the screen.",
          },
        ],
      },
    ],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.ANY,
        allowedFunctionNames: ["print"],
      },
    },
  });
  const call = (completion.response.functionCalls() ?? [])?.[0];
  TestValidator.equals("name")(call?.name)("print");
  TestValidator.equals("arguments")(call?.args)({});
};
