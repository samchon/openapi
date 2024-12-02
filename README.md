# `@samchon/openapi`
```mermaid
flowchart
  subgraph "OpenAPI Specification"
    v20("Swagger v2.0") --upgrades--> emended[["OpenAPI v3.1 (emended)"]]
    v30("OpenAPI v3.0") --upgrades--> emended
    v31("OpenAPI v3.1") --emends--> emended
  end
  subgraph "OpenAPI Generator"
    emended --normalizes--> migration[["Migration Schema"]]
    migration --"Artificial Intelligence"--> lfc{{"LLM Function Calling"}}
    lfc --"OpenAI"--> chatgpt("ChatGPT")
    lfc --"Anthropic"--> claude("Claude")
    lfc --"Google"--> gemini("Gemini")
    lfc --"Meta"--> llama("Llama")
  end
```

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/openapi/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@samchon/openapi.svg)](https://www.npmjs.com/package/@samchon/openapi.svg)
[![Downloads](https://img.shields.io/npm/dm/@samchon/openapi.svg)](https://www.npmjs.com/package/@samchon/openapi)
[![Build Status](https://github.com/samchon/openapi/workflows/build/badge.svg)](https://github.com/samchon/openapi/actions?query=workflow%3Abuild)

OpenAPI definitions, converters and LLM function calling application composer.

`@samchon/openapi` is a collection of OpenAPI types for every versions, and converters for them. In the OpenAPI types, there is an "emended" OpenAPI v3.1 specification, which has removed ambiguous and duplicated expressions for the clarity. Every conversions are based on the emended OpenAPI v3.1 specification.

  1. [Swagger v2.0](https://github.com/samchon/openapi/blob/master/src/SwaggerV2.ts)
  2. [OpenAPI v3.0](https://github.com/samchon/openapi/blob/master/src/OpenApiV3.ts)
  3. [OpenAPI v3.1](https://github.com/samchon/openapi/blob/master/src/OpenApiV3_1.ts)
  4. [**OpenAPI v3.1 emended**](https://github.com/samchon/openapi/blob/master/src/OpenApi.ts)

`@samchon/openapi` also provides LLM (Large Language Model) function calling application composer from the OpenAPI document with many strategies. With the [`HttpLlm`](https://github.com/samchon/openapi/blob/master/src/HttpLlm.ts) module, you can perform the LLM funtion calling extremely easily just by delivering the OpenAPI (Swagger) document.

  - [`HttpLlm.application()`](https://github.com/samchon/openapi/blob/master/src/HttpLlm.ts)
  - [`IHttpLlmApplication<Model>`](https://github.com/samchon/openapi/blob/master/src/structures/ILlmApplication.ts)
  - [`IHttpLlmFunction<Model>`](https://github.com/samchon/openapi/blob/master/src/structures/ILlmFunction.ts)
  - Supported schemas
    - [`IChatGptSchema`](https://github.com/samchon/openapi/blob/master/src/structures/IChatGptSchema.ts): OpenAI ChatGPT
    - [`IClaudeSchema`](https://github.com/samchon/openapi/blob/master/src/structures/IClaudeSchema.ts): Anthropic Claude
    - [`IGeminiSchema`](https://github.com/samchon/openapi/blob/master/src/structures/IGeminiSchema.ts): Google Gemini
    - [`ILlamaSchema`](https://github.com/samchon/openapi/blob/master/src/structures/ILlamaSchema.ts): Meta Llama
  - Midldle layer schemas
    - [`ILlmSchemaV3`](https://github.com/samchon/openapi/blob/master/src/structures/ILlmSchemaV3.ts): middle layer based on OpenAPI v3.0 specification
    - [`ILlmSchemaV3_1`](https://github.com/samchon/openapi/blob/master/src/structures/ILlmSchemaV3_1.ts): middle layer based on OpenAPI v3.1 specification




## Setup
```bash
npm install @samchon/openapi
```

Just install by `npm i @samchon/openapi` command.

Here is an example code utilizing the `@samchon/openapi` for LLM function calling purpose. 

```typescript
import {
  HttpLlm,
  IChatGptSchema,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import fs from "fs";
import typia from "typia";

const main = async (): Promise<void> => {
  // read swagger document and validate it
  const swagger:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument = JSON.parse(
    await fs.promises.readFile("swagger.json", "utf8"),
  );
  typia.assert(swagger); // recommended

  // convert to emended OpenAPI document,
  // and compose LLM function calling application
  const document: OpenApi.IDocument = OpenApi.convert(swagger);
  const application: IHttpLlmApplication<"chatgpt"> = HttpLlm.application({
    model: "chatgpt",
    document,
  });

  // Let's imagine that LLM has selected a function to call
  const func: IHttpLlmFunction<"chatgpt"> | undefined = 
    application.functions.find(
      // (f) => f.name === "llm_selected_fuction_name"
      (f) => f.path === "/bbs/articles" && f.method === "post",
    );
  if (func === undefined) throw new Error("No matched function exists.");

  // actual execution is by yourself
  const article = await HttpLlm.execute({
    connection: {
      host: "http://localhost:3000",
    },
    application,
    function: func,
    arguments: {
      // arguments composed by LLM 
      body: {
        title: "Hello, world!",
        body: "Let's imagine that this argument is composed by LLM.",
        thumbnail: null,
      },
    },
  });
  console.log("article", article);
};
main().catch(console.error);
```




## OpenAPI Definitions
```mermaid
flowchart
  v20(Swagger v2.0) --upgrades--> emended[["<b><u>OpenAPI v3.1 (emended)</u></b>"]]
  v30(OpenAPI v3.0) --upgrades--> emended
  v31(OpenAPI v3.1) --emends--> emended
  emended --downgrades--> v20d(Swagger v2.0)
  emended --downgrades--> v30d(Swagger v3.0)
```

`@samchon/openapi` support every versions of OpenAPI specifications with detailed TypeScript types.

  - [Swagger v2.0](https://github.com/samchon/openapi/blob/master/src/SwaggerV2.ts)
  - [OpenAPI v3.0](https://github.com/samchon/openapi/blob/master/src/OpenApiV3.ts)
  - [OpenAPI v3.1](https://github.com/samchon/openapi/blob/master/src/OpenApiV3_1.ts)
  - [**OpenAPI v3.1 emended**](https://github.com/samchon/openapi/blob/master/src/OpenApi.ts)

Also, `@samchon/openapi` provides "emended OpenAPI v3.1 definition" which has removed ambiguous and duplicated expressions for clarity. It has emended original OpenAPI v3.1 specification like above. You can compose the "emended OpenAPI v3.1 document" by calling the `OpenApi.convert()` function. 

  - Operation
    - Merge `OpenApiV3_1.IPathItem.parameters` to `OpenApi.IOperation.parameters`
    - Resolve references of `OpenApiV3_1.IOperation` members
    - Escape references of `OpenApiV3_1.IComponents.examples`
  - JSON Schema
    - Decompose mixed type: `OpenApiV3_1.IJsonSchema.IMixed`
    - Resolve nullable property: `OpenApiV3_1.IJsonSchema.__ISignificant.nullable`
    - Array type utilizes only single `OpenAPI.IJsonSchema.IArray.items`
    - Tuple type utilizes only `OpenApi.IJsonSchema.ITuple.prefixItems`
    - Merge `OpenApiV3_1.IJsonSchema.IAnyOf` to `OpenApi.IJsonSchema.IOneOf`
    - Merge `OpenApiV3_1.IJsonSchema.IRecursiveReference` to `OpenApi.IJsonSchema.IReference`
    - Merge `OpenApiV3_1.IJsonSchema.IAllOf` to `OpenApi.IJsonSchema.IObject`

Conversions to another version's OpenAPI document is also based on the "emended OpenAPI v3.1 specification" like above diagram. You can do it through `OpenApi.downgrade()` function. Therefore, if you want to convert Swagger v2.0 document to OpenAPI v3.0 document, you have to call two functions; `OpenApi.convert()` and then `OpenApi.downgrade()`.

At last, if you utilize `typia` library with `@samchon/openapi` types, you can validate whether your OpenAPI document is following the standard specification or not. Just visit one of below playground links, and paste your OpenAPI document URL address. This validation strategy would be superior than any other OpenAPI validator libraries.

  - Playground Links
    - [💻 Type assertion](https://typia.io/playground/?script=JYWwDg9gTgLgBAbzgeTAUwHYEEzADQrra4BqAzAapjsOQPoCMBAygO4CGA5p2lCQExwAvnABmUCCDgAiAAIBndiADGACwgYA9BCLtc0gNwAoUJFhwYAT1zsxEqdKs3DRo8o3z4IdsAxwAvHDs8pYYynAAFACUAFxwAAr2wPJoADwAbhDAACYAfAH5CEZwcJqacADiAKIAKnAAmsgAqgBKKPFVAHJY8QCScAAiyADCTQCyXTXFcO4YnnBQaPKQc2hxLUsrKQFBHMDwomgwahHTJdKqMDBg8jFlUOysAHSc+6oArgBG7ylQszCYGBPdwgTSKFTqLQ6TB6YCabyeXiaNAADyUYAANktNOkyE8AAzaXTAJ4AK3kGmk0yixhKs3m2QgyneIEBcXYGEsO0ePngi2WHjQZIpGGixmmZTgNXqHTgWGYzCqLRqvWQnWmTmA7CewV+MAq73YUGyqTOcAAPoRqKQyIwnr0BkyWYCzZaqMRaHiHU7WRgYK64GwuDw+Px7Y7mb7-SVchFGZHATTXCVJcM1SQlXUasg4FUJp0BlUBtN6fA0L7smhsnF3TRwz7ATta7hgRp0rwYHGG36k3SPBAsU9fKIIBFy5hK9kk0JjN5fNFgexjqoIvSB0LeBIoDSgA)
    - [💻 Detailed validation](https://typia.io/playground/?script=JYWwDg9gTgLgBAbzgeTAUwHYEEzADQrra4BqAzAapjsOQPoCMBAygO4CGA5p2lCQExwAvnABmUCCDgAiAAIBndiADGACwgYA9BCLtc0gNwAoUJFhwYAT1zsxEqdKs3DRo8o3z4IdsAxwAvHDs8pYYynAAFACUAFxwAAr2wPJoADwAbhDAACYAfAH5CEZwcJqacADiAKIAKnAAmsgAqgBKKPFVAHJY8QCScAAiyADCTQCyXTXFcO4YnnBQaPKQc2hxLUsrKQFBHMDwomgwahHTJdKqMDBg8jFlUOysAHSc+6oArgBG7ylQszCYGBPdwgTSKFTqLQ6TB6YCabyeXiaNAADyUYAANktNOkyE8AAzaXTAJ4AK3kGmk0yixhKs3m2QgyneIEBcXYGEsO0ePngi2WHjQZIpGGixmmZTgNXqHTgJCwABlegMsDVeshOtN6Xylu8MfBAk5gOwnul2BicuwAakznAAD6EaikMiMJ7KpkswG2h1UYi0PHu5msjAwb1wNhcHh8fhugYe4Ohkq5CKMoOAmnTYCiSL8vVA+TvZTKJbyAL+QKic0pKKIW30iBYp6+UQQCK5-VPXgSKDyDMlEqLGDvKAYWnCVwlSXDDUkKotOo1ZBwKoTToDKoDLUeeBoYPZNDZOK+mix+OAnbH3DAjTpXgwFNnkN9mYeBtC5ut3eYffZDNCYzeL40TAlaJz1o2XbQDSQA)

```typescript
import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import typia from "typia";
 
const main = async (): Promise<void> => {
  // GET YOUR OPENAPI DOCUMENT
  const response: Response = await fetch(
    "https://raw.githubusercontent.com/samchon/openapi/master/examples/v3.0/openai.json"
  );
  const document: any = await response.json();
 
  // TYPE VALIDATION
  const result = typia.validate<
    | OpenApiV3_1.IDocument
    | OpenApiV3.IDocument
    | SwaggerV2.IDocument
  >(document);
  if (result.success === false) {
    console.error(result.errors);
    return;
  }
 
  // CONVERT TO EMENDED
  const emended: OpenApi.IDocument = OpenApi.convert(document);
  console.info(emended);
};
main().catch(console.error);
```




## LLM Function Calling
### Preface
```mermaid
flowchart TD
  subgraph "OpenAPI Specification"
    v20("Swagger v2.0") --upgrades--> emended[["OpenAPI v3.1 (emended)"]]
    v30("OpenAPI v3.0") --upgrades--> emended
    v31("OpenAPI v3.1") --emends--> emended
  end
  subgraph "OpenAPI Generator"
    emended --normalizes--> migration[["Migration Schema"]]
    migration --"Artificial Intelligence"--> lfc{{"<b><u>LLM Function Calling</b></u>"}}
    lfc --"OpenAI"--> chatgpt("ChatGPT")
    lfc --"Anthropic"--> claude("Claude")
    lfc --"Google"--> gemini("Gemini")
    lfc --"Meta"--> llama("Llama")
  end
```

LLM function calling application from OpenAPI document.

`@samchon/openapi` provides LLM (Large Language Model) funtion calling application from the "emended OpenAPI v3.1 document". Therefore, if you have any HTTP backend server and succeeded to build an OpenAPI document, you can easily make the A.I. chatbot application.

In the A.I. chatbot, LLM will select proper function to remotely call from the conversations with user, and fill arguments of the function automatically. If you actually execute the function call through the `HttpLlm.execute()` funtion, it is the "LLM function call."

Let's enjoy the fantastic LLM function calling feature very easily with `@samchon/openapi`.

  - Application
    - [`HttpLlm.application()`](https://github.com/samchon/openapi/blob/master/src/HttpLlm.ts)
    - [`IHttpLlmApplication`](https://github.com/samchon/openapi/blob/master/src/structures/ILlmApplication.ts)
    - [`IHttpLlmFunction`](https://github.com/samchon/openapi/blob/master/src/structures/ILlmFunction.ts)
  - Schemas
    - [`IChatGptSchema`](https://github.com/samchon/openapi/blob/master/src/structures/IChatGptSchema.ts): OpenAI ChatGPT
    - [`IClaudeSchema`](https://github.com/samchon/openapi/blob/master/src/structures/IClaudeSchema.ts): Anthropic Claude
    - [`IGeminiSchema`](https://github.com/samchon/openapi/blob/master/src/structures/IGeminiSchema.ts): Google Gemini
    - [`ILlamaSchema`](https://github.com/samchon/openapi/blob/master/src/structures/ILlamaSchema.ts): Meta Llama
    - [`ILlmSchemaV3`](https://github.com/samchon/openapi/blob/master/src/structures/ILlmSchemaV3.ts): middle layer based on OpenAPI v3.0 specification
    - [`ILlmSchemaV3_1`](https://github.com/samchon/openapi/blob/master/src/structures/ILlmSchemaV3_1.ts): middle layer based on OpenAPI v3.1 specification
  - Type Checkers
    - [`ChatGptTypeChecker`](https://github.com/samchon/openapi/blob/master/src/utils/ChatGptTypeChecker.ts)
    - [`ClaudeTypeChecker`](https://github.com/samchon/openapi/blob/master/src/utils/ClaudeTypeChecker.ts)
    - [`GeminiTypeChecker`](https://github.com/samchon/openapi/blob/master/src/utils/GeminiTypeChecker.ts)
    - [`LlamaTypeChecker`](https://github.com/samchon/openapi/blob/master/src/utils/LlamaTypeChecker.ts)
    - [`LlmTypeCheckerV3`](https://github.com/samchon/openapi/blob/master/src/utils/LlmTypeCheckerV3.ts)
    - [`LlmTypeCheckerV3_1`](https://github.com/samchon/openapi/blob/master/src/utils/LlmTypeCheckerV3_1.ts)

> [!NOTE]
>
> You also can compose [`ILlmApplication`](https://github.com/samchon/openapi/blob/master/src/structures/ILlmApplication.ts) from a class type with `typia`.
>
> https://typia.io/docs/llm/application
>
> ```typescript
> import { ILlmApplication } from "@samchon/openapi";
> import typia from "typia";
>
> const app: ILlmApplication<"chatgpt"> =
>   typia.llm.application<YourClassType, "chatgpt">();
> ```

> [!TIP]
>
> LLM selects proper function and fill arguments.
> 
> In nowadays, most LLM (Large Language Model) like OpenAI are supporting "function calling" feature. The "LLM function calling" means that LLM automatically selects a proper function and fills parameter values from conversation with the user (may by chatting text).
> 
> https://platform.openai.com/docs/guides/function-calling

### Execution
Actual function call execution is by yourself.

LLM (Large Language Model) providers like OpenAI selects a proper function to call from the conversations with users, and fill arguments of it. However, function calling feature supported by LLM providers do not perform the function call execution. The actual execution responsibility is on you.

In `@samchon/openapi`, you can execute the LLM function calling by `HttpLlm.execute()` (or `HttpLlm.propagate()`) function. Here is an example code executing the LLM function calling through the `HttpLlm.execute()` function. As you can see, to execute the LLM function call, you have to deliver these informations:

  - Connection info to the HTTP server
  - Application of the LLM fuction calling
  - LLM function schema to call
  - Arguments for the function call (maybe composed by LLM)

Here is the example code executing the LLM function call with `@samchon/openapi`.

  - Example Code: [`test/examples/chatgpt-function-call-to-sale-create.ts`](https://github.com/samchon/openapi/blob/master/test/examples/chatgpt-function-call-to-sale-create.ts)
  - Prompt describing the produc to create:  [`Microsoft Surpace Pro 9`](https://github.com/samchon/openapi/blob/master/test/executable/chatgpt-function-calling.ts)
  - Result of the Function Calling: [`examples/arguments/chatgpt.microsoft-surface-pro-9.input.json`](https://github.com/samchon/openapi/blob/master/examples/function-calling/arguments/chatgpt.microsoft-surface-pro-9.input.json)

```typescript
import {
  HttpLlm,
  IChatGptSchema,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import OpenAI from "openai";
import typia from "typia";

const main = async (): Promise<void> => {
  // Read swagger document and validate it
  const swagger:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument = JSON.parse(
    await fetch(
      "https://github.com/samchon/shopping-backend/blob/master/packages/api/swagger.json",
    ).then((r) => r.json()),
  );
  typia.assert(swagger); // recommended

  // convert to emended OpenAPI document,
  // and compose LLM function calling application
  const document: OpenApi.IDocument = OpenApi.convert(swagger);
  const application: IHttpLlmApplication<"chatgpt"> = HttpLlm.application({
    model: "chatgpt",
    document,
  });

  // Let's imagine that LLM has selected a function to call
  const func: IHttpLlmFunction<"chatgpt"> | undefined =
    application.functions.find(
      // (f) => f.name === "llm_selected_fuction_name"
      (f) => f.path === "/shoppings/sellers/sale" && f.method === "post",
    );
  if (func === undefined) throw new Error("No matched function exists.");

  // Get arguments by ChatGPT function calling
  const client: OpenAI = new OpenAI({
    apiKey: "<YOUR_OPENAI_API_KEY>",
  });
  const completion: OpenAI.ChatCompletion =
    await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "assistant",
          content:
            "You are a helpful customer support assistant. Use the supplied tools to assist the user.",
        },
        {
          role: "user",
          content: "<DESCRIPTION ABOUT THE SALE>",
          // https://github.com/samchon/openapi/blob/master/examples/function-calling/prompts/microsoft-surface-pro-9.md
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: func.name,
            description: func.description,
            parameters: func.parameters as Record<string, any>,
            strict: true,
          },
        },
      ],
    });
  const toolCall: OpenAI.ChatCompletionMessageToolCall =
    completion.choices[0].message.tool_calls![0];

  // Actual execution by yourself
  const article = await HttpLlm.execute({
    connection: {
      host: "http://localhost:37001",
    },
    application,
    function: func,
    input: JSON.parse(toolCall.function.arguments),
  });
  console.log("article", article);
};
main().catch(console.error);
```

### Separation
Arguments from both Human and LLM sides.

When composing parameter arguments through the LLM (Large Language Model) function calling, there can be a case that some parameters (or nested properties) must be composed not by LLM, but by Human. File uploading feature, or sensitive information like secret key (password) cases are the representative examples.

In that case, you can configure the LLM function calling schemas to exclude such Human side parameters (or nested properties) by `IHttpLlmApplication.options.separate` property. Instead, you have to merge both Human and LLM composed parameters into one by calling the `HttpLlm.mergeParameters()` before the LLM function call execution of `HttpLlm.execute()` function.

Here is the example code separating the file uploading feature from the LLM function calling schema, and combining both Human and LLM composed parameters into one before the LLM function call execution.

  - Example Code: [`test/examples/claude-function-call-separate-to-sale-create.ts`](https://github.com/samchon/openapi/blob/master/test/examples/claude-function-call-separate-to-sale-create.ts.ts)
  - Prompt describing the produc to create:  [`Microsoft Surpace Pro 9`](https://github.com/samchon/openapi/blob/master/test/executable/chatgpt-function-calling.ts)
  - Result of the Function Calling: [`examples/arguments/claude.microsoft-surface-pro-9.input.json`](https://github.com/samchon/openapi/blob/master/examples/function-calling/arguments/claude.microsoft-surface-pro-9.input.json)

```typescript
import Anthropic from "@anthropic-ai/sdk";
import {
  ClaudeTypeChecker,
  HttpLlm,
  IClaudeSchema,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
  OpenApiV3,
  OpenApiV3_1,
  SwaggerV2,
} from "@samchon/openapi";
import typia from "typia";

const main = async (): Promise<void> => {
  // Read swagger document and validate it
  const swagger:
    | SwaggerV2.IDocument
    | OpenApiV3.IDocument
    | OpenApiV3_1.IDocument = JSON.parse(
    await fetch(
      "https://github.com/samchon/shopping-backend/blob/master/packages/api/swagger.json",
    ).then((r) => r.json()),
  );
  typia.assert(swagger); // recommended

  // convert to emended OpenAPI document,
  // and compose LLM function calling application
  const document: OpenApi.IDocument = OpenApi.convert(swagger);
  const application: IHttpLlmApplication<"claude"> = HttpLlm.application({
    model: "claude",
    document,
    options: {
      reference: true,
      separate: (schema) =>
        ClaudeTypeChecker.isString(schema) &&
        !!schema.contentMediaType?.startsWith("image"),
    },
  });

  // Let's imagine that LLM has selected a function to call
  const func: IHttpLlmFunction<"claude"> | undefined =
    application.functions.find(
      // (f) => f.name === "llm_selected_fuction_name"
      (f) => f.path === "/shoppings/sellers/sale" && f.method === "post",
    );
  if (func === undefined) throw new Error("No matched function exists.");

  // Get arguments by ChatGPT function calling
  const client: Anthropic = new Anthropic({
    apiKey: "<YOUR_ANTHROPIC_API_KEY>",
  });
  const completion: Anthropic.Message = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 8_192,
    messages: [
      {
        role: "assistant",
        content:
          "You are a helpful customer support assistant. Use the supplied tools to assist the user.",
      },
      {
        role: "user",
        content: "<DESCRIPTION ABOUT THE SALE>",
        // https://github.com/samchon/openapi/blob/master/examples/function-calling/prompts/microsoft-surface-pro-9.md
      },
    ],
    tools: [
      {
        name: func.name,
        description: func.description,
        input_schema: func.separated!.llm as any,
      },
    ],
  });
  const toolCall: Anthropic.ToolUseBlock = completion.content.filter(
    (c) => c.type === "tool_use",
  )[0]!;

  // Actual execution by yourself
  const article = await HttpLlm.execute({
    connection: {
      host: "http://localhost:37001",
    },
    application,
    function: func,
    input: HttpLlm.mergeParameters({
      function: func,
      llm: toolCall.input as any,
      human: {
        // Human composed parameter values
        content: {
          files: [],
          thumbnails: [
            {
              name: "thumbnail",
              extension: "jpeg",
              url: "https://serpapi.com/searches/673d3a37e45f3316ecd8ab3e/images/1be25e6e2b1fb7509f1af89c326cb41749301b94375eb5680b9bddcdf88fabcb.jpeg",
            },
            // ...
          ],
        },
      },
    }),
  });
  console.log("article", article);
};
main().catch(console.error);
```