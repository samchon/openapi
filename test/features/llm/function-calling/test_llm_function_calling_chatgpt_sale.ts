import { TestValidator } from "@nestia/e2e";
import { IChatGptSchema, OpenApi } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";
import OpenAI from "openai";
import { ChatCompletion } from "openai/resources";
import typia, { IJsonSchemaCollection } from "typia";

import { TestGlobal } from "../../../TestGlobal";
import { IShoppingSale } from "../../../structures/IShoppingSale";

export const test_llm_function_calling_chatgpt_sale =
  async (): Promise<void> => {
    if (TestGlobal.env.OPENAI_API_KEY === undefined) return;

    const collection: IJsonSchemaCollection =
      typia.json.schemas<[{ input: IShoppingSale.ICreate }]>();
    const parameters: IChatGptSchema.IParameters | null =
      ChatGptConverter.parameters({
        components: collection.components,
        schema: typia.assert<OpenApi.IJsonSchema.IObject>(
          collection.schemas[0],
        ),
      });
    if (parameters === null)
      throw new Error(
        "Failed to convert the JSON schema to the ChatGPT schema.",
      );

    const client: OpenAI = new OpenAI({
      apiKey: TestGlobal.env.OPENAI_API_KEY,
    });
    const completion: ChatCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_MESSAGE,
        },
        {
          role: "user",
          content: USER_MESSAGE,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "createSale",
            description: "Create a sale and returns the detailed information.",
            parameters: parameters as any,
            strict: true,
          },
        },
      ],
    });
    (completion.choices[0].message.tool_calls ?? []).forEach((call) => {
      TestValidator.equals("name")(call.function.name)("createSale");
      typia.assert<{
        input: IShoppingSale.ICreate;
      }>(JSON.parse(call.function.arguments));
    });
  };

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";
const USER_MESSAGE = `
  I will create a sale with the following details.
  At first, title of the sale is "Surface Pro 8".
  Then, the sale has a description "The best laptop for your daily needs.".

  Also, it has only two unit, the "Surface Pro 8 Entity" and "Warranty Program".

  About the "Warranty Program" unit, it is not essential to the sale, 
  and there is no option to select. Its nominal price is $100, and 
  the real price is $89.

  About the "Surface Pro 8 Entity", it is essential to the sale, and 
  there are two options to select like below.

    - CPU
      - Intel Core i3
      - Intel Core i5
      - Intel Core i7
    - RAM
      - 8 GB
      - 16 GB
      - 32 GB
    - Storage
      - 128 GB
      - 256 GB
      - 512 GB
      
  The final stocks combinated by the options are like below. 
  The sequence of selected options are 
  {(CPU, RAM, Storage): (nominal price / real price)}.

    - (i3, 8 GB, 128 GB): ($999 / $899)
    - (i3, 16 GB, 256 GB): ($1,199 / $1,099)
    - (i3, 16 GB, 512 GB): ($1,399 / $1,299)
    - (i5, 16 GB, 256 GB): ($1,499 / $1,399)
    - (i5, 32 GB, 512 GB): ($1,799 / $1,699)
    - (i7, 16 GB, 512 GB): ($1,799 / $1,699)
    - (i7, 32 GB, 512 GB): ($1,999 / $1,899)
`;
