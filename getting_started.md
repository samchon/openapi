# Getting Started with @samchon/openapi

This guide will help you get started with `@samchon/openapi`, a powerful library for working with OpenAPI definitions, converters, and LLM function calling applications.

## Installation

To install `@samchon/openapi`, use npm:

```bash
npm install @samchon/openapi
```

## Basic Usage

### OpenAPI Definitions

`@samchon/openapi` supports various versions of OpenAPI specifications:

1. Swagger v2.0
2. OpenAPI v3.0
3. OpenAPI v3.1
4. OpenAPI v3.1 (emended)

Here's an example of how to use the library to convert and validate OpenAPI documents:

```typescript
import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "@samchon/openapi";
import typia from "typia";

const main = async (): Promise<void> => {
  // Get your OpenAPI document
  const response: Response = await fetch(
    "https://raw.githubusercontent.com/samchon/openapi/master/examples/v3.0/openai.json"
  );
  const document: any = await response.json();

  // Validate the document
  const result = typia.validate<
    | OpenApiV3_1.IDocument
    | OpenApiV3.IDocument
    | SwaggerV2.IDocument
  >(document);
  if (result.success === false) {
    console.error(result.errors);
    return;
  }

  // Convert to emended OpenAPI v3.1
  const emended: OpenApi.IDocument = OpenApi.convert(document);
  console.info(emended);
};

main().catch(console.error);
```

### LLM Function Calling

`@samchon/openapi` provides LLM (Large Language Model) function calling applications from OpenAPI documents. Here's a basic example:

```typescript
import {
  HttpLlm,
  IChatGptSchema,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
} from "@samchon/openapi";
import OpenAI from "openai";

const main = async (): Promise<void> => {
  // Load and convert your OpenAPI document
  const document: OpenApi.IDocument = /* ... */;

  // Create LLM function calling application
  const application: IHttpLlmApplication<"chatgpt"> = HttpLlm.application({
    model: "chatgpt",
    document,
  });

  // Find a specific function
  const func: IHttpLlmFunction<"chatgpt"> | undefined =
    application.functions.find(
      (f) => f.path === "/example/path" && f.method === "post"
    );
  if (func === undefined) throw new Error("No matched function exists.");

  // Use OpenAI to get function call arguments
  const client: OpenAI = new OpenAI({ apiKey: "YOUR_API_KEY" });
  const completion: OpenAI.ChatCompletion = await client.chat.completions.create({
    model: "gpt-4",
    messages: [/* ... */],
    tools: [
      {
        type: "function",
        function: {
          name: func.name,
          description: func.description,
          parameters: func.parameters as Record<string, any>,
        },
      },
    ],
  });

  // Execute the function call
  const result = await HttpLlm.execute({
    connection: { host: "http://your-api-host.com" },
    application,
    function: func,
    input: JSON.parse(completion.choices[0].message.tool_calls![0].function.arguments),
  });

  console.log("Result:", result);
};

main().catch(console.error);
```

## Key Features

1. **OpenAPI Support**: Work with various OpenAPI versions, including Swagger v2.0, OpenAPI v3.0, and OpenAPI v3.1.
2. **Emended OpenAPI v3.1**: Use the improved and clarified version of OpenAPI v3.1.
3. **Document Conversion**: Convert between different OpenAPI versions.
4. **Validation**: Validate OpenAPI documents using `typia`.
5. **LLM Function Calling**: Generate LLM function calling applications from OpenAPI documents.
6. **Multiple LLM Support**: Work with various LLM providers, including OpenAI (ChatGPT), Anthropic (Claude), Google (Gemini), and Meta (Llama).

## Next Steps

To learn more about `@samchon/openapi`, explore the following topics:

- Advanced OpenAPI document manipulation
- Detailed LLM function calling scenarios
- Working with different LLM providers
- Validation feedback for LLM function calls
- Separating human and LLM inputs in function calls

For more detailed information, refer to the [API documentation](https://samchon.github.io/openapi/api/) and the [GitHub repository](https://github.com/samchon/openapi).