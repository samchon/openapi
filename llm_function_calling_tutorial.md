# LLM Function Calling Tutorial with @samchon/openapi

## Introduction

This tutorial will guide you through the process of using @samchon/openapi for LLM (Large Language Model) function calling. We'll cover how to set up your application, convert OpenAPI documents to LLM function schemas, and execute LLM function calls.

## Prerequisites

- Basic knowledge of TypeScript and OpenAPI
- Familiarity with LLM concepts
- @samchon/openapi library installed in your project

## Setting up the LLM Application

To get started with LLM function calling using @samchon/openapi, you'll need to create an `IHttpLlmApplication`. This application will contain the LLM functions converted from your OpenAPI document.

```typescript
import { HttpLlm } from "@samchon/openapi";
import { OpenApi } from "@samchon/openapi";

// Load your OpenAPI document
const document: OpenApi.IDocument = // ... load your OpenAPI document

// Create the LLM application
const application = HttpLlm.application({
  model: "gpt-3.5-turbo", // Or any other supported LLM model
  document: document,
  options: {
    separate: true, // Optional: Separate parameters into LLM and human sides
    maxLength: 64, // Optional: Maximum length for function names
  }
});
```

The `HttpLlm.application()` function converts your OpenAPI document into an `IHttpLlmApplication`, which contains LLM function schemas ready for use with your chosen LLM model.

## Understanding LLM Functions

Each API operation in your OpenAPI document is converted to an `IHttpLlmFunction`. These functions contain:

- `name`: A representative name for the function
- `parameters`: Input parameters for the function
- `output`: Expected return type
- `description`: Detailed description of the function's purpose
- `validate`: A function to validate input arguments

If you've enabled parameter separation, you'll also have:

- `separated.llm`: Parameters to be filled by the LLM
- `separated.human`: Parameters to be filled by humans
- `separated.validate`: A function to validate LLM-provided arguments

## Executing LLM Function Calls

Once you have your LLM application set up, you can execute function calls using the `HttpLlm.execute()` or `HttpLlm.propagate()` methods.

```typescript
import { HttpLlm, IHttpConnection } from "@samchon/openapi";

// Assuming you have selected a function and have LLM-generated input
const selectedFunction = application.functions[0];
const llmInput = { /* LLM-generated input */ };

// Set up your HTTP connection
const connection: IHttpConnection = {
  host: "api.example.com",
  port: 443,
  protocol: "https",
};

// Execute the function call
const result = await HttpLlm.execute({
  application: application,
  function: selectedFunction,
  connection: connection,
  input: llmInput,
});

console.log("Function call result:", result);
```

If you're using parameter separation, you'll need to merge the LLM and human inputs before execution:

```typescript
const humanInput = { /* Human-provided input */ };
const mergedInput = HttpLlm.mergeParameters({
  function: selectedFunction,
  llm: llmInput,
  human: humanInput,
});

const result = await HttpLlm.execute({
  application: application,
  function: selectedFunction,
  connection: connection,
  input: mergedInput,
});
```

## Best Practices

1. **Validate inputs**: Always use the `validate` function provided with each LLM function to check inputs before execution. This helps catch and correct errors in LLM-generated arguments.

2. **Handle errors**: Use try-catch blocks when executing function calls to handle potential errors, including validation errors and HTTP errors.

3. **Use descriptive function names and descriptions**: The LLM relies on function names and descriptions to understand their purpose. Make sure these are clear and informative.

4. **Separate sensitive parameters**: Use the `separate` option to keep sensitive information on the human side when necessary.

5. **Monitor and log**: Keep track of successful and failed function calls to improve your application's reliability and identify areas for improvement.

## Conclusion

This tutorial has covered the basics of using @samchon/openapi for LLM function calling. By leveraging the power of OpenAPI documents and the flexibility of the @samchon/openapi library, you can create robust applications that interact with LLMs effectively. Remember to refer to the API documentation for more detailed information on available methods and options.