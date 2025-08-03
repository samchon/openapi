# Claude Function Calling with @samchon/openapi

![Claude Integration](https://img.shields.io/badge/Claude-3.5%20Sonnet-orange?style=flat&logo=anthropic)
[![npm version](https://img.shields.io/npm/v/@samchon/openapi.svg)](https://www.npmjs.com/package/@samchon/openapi)
[![API Documents](https://img.shields.io/badge/API-Documents-forestgreen)](https://samchon.github.io/openapi/api/)

Welcome Claude Code users! This guide shows you how to leverage the `@samchon/openapi` library to build powerful function calling applications with Anthropic's Claude models.

## Overview

`@samchon/openapi` provides first-class support for Claude function calling through:

- **Standard JSON Schema**: Claude uses standard OpenAPI v3.1 JSON Schema (unlike ChatGPT's custom format)
- **Advanced Validation**: Built-in validation with detailed error feedback to improve LLM accuracy  
- **Parameter Separation**: Mix LLM-generated and human-provided parameters seamlessly
- **Type Safety**: Full TypeScript support with comprehensive type definitions

```mermaid
flowchart LR
    swagger[OpenAPI Document] --> convert[OpenApi.convert]
    convert --> app[HttpLlm.application]
    app --> claude[Claude Function Call]
    claude --> execute[HttpLlm.execute]
    execute --> api[HTTP API Call]
```

## Quick Start

### Installation

```bash
npm install @samchon/openapi @anthropic-ai/sdk
```

### Basic Example

```typescript
import Anthropic from "@anthropic-ai/sdk";
import {
  HttpLlm,
  IClaudeSchema,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
} from "@samchon/openapi";

const main = async (): Promise<void> => {
  // 1. Load and convert your OpenAPI document
  const swagger = await fetch("your-api-swagger.json").then(r => r.json());
  const document: OpenApi.IDocument = OpenApi.convert(swagger);

  // 2. Create Claude function calling application
  const application: IHttpLlmApplication<"claude"> = HttpLlm.application({
    model: "claude",
    document,
  });

  // 3. Initialize Claude client
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // 4. Find the function you want to call
  const func: IHttpLlmFunction<"claude"> | undefined = 
    application.functions.find(f => f.name === "your_function_name");

  // 5. Let Claude generate function arguments
  const completion = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: "Create a new blog post about AI development"
      }
    ],
    tools: [{
      name: func.name,
      description: func.description,
      input_schema: func.parameters as any,
    }],
  });

  const toolCall = completion.content.find(c => c.type === "tool_use");

  // 6. Execute the function call
  const result = await HttpLlm.execute({
    connection: { host: "https://your-api.com" },
    application,
    function: func,
    input: toolCall.input,
  });

  console.log("Result:", result);
};
```

## Claude-Specific Features

### 1. Standard JSON Schema Support

Claude supports OpenAPI v3.1 standard JSON Schema, making it highly compatible:

```typescript
// Claude schema follows standard JSON Schema v3.1
const schema: IClaudeSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "Blog post title" },
    content: { type: "string", description: "Blog post content" },
    tags: { 
      type: "array", 
      items: { type: "string" },
      description: "Post tags"
    }
  },
  required: ["title", "content"],
  additionalProperties: false
};
```

### 2. Validation Feedback for Better Accuracy

Claude function calling isn't perfect. Use validation feedback to improve accuracy from ~70% to 98%:

```typescript
import { IValidation } from "@samchon/openapi";

const executeWithValidation = async (
  client: Anthropic,
  func: IHttpLlmFunction<"claude">,
  userMessage: string
): Promise<unknown> => {
  let attempt = 1;
  const maxAttempts = 3;

  while (attempt <= maxAttempts) {
    const completion = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 8192,
      messages: [
        { role: "user", content: userMessage }
      ],
      tools: [{
        name: func.name,
        description: func.description,
        input_schema: func.parameters as any,
      }],
    });

    const toolCall = completion.content.find(c => c.type === "tool_use");
    
    // Validate the arguments
    const validation: IValidation<unknown> = func.validate(toolCall.input);
    
    if (validation.success) {
      // Valid! Execute the function
      return await HttpLlm.execute({
        connection: { host: "https://your-api.com" },
        application,
        function: func,
        input: validation.data,
      });
    }

    // Invalid - provide feedback for retry
    userMessage += `\n\nValidation errors in attempt ${attempt}: ${
      validation.errors.map(e => `${e.path}: ${e.message}`).join(", ")
    }. Please correct these issues.`;
    
    attempt++;
  }

  throw new Error("Failed to get valid function arguments after maximum attempts");
};
```

### 3. Parameter Separation

Separate LLM-generated parameters from human-provided ones (useful for file uploads, secrets):

```typescript
import { ClaudeTypeChecker, HttpLlm } from "@samchon/openapi";

// Create application with separation config
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

const func = application.functions.find(f => f.name === "create_post");

// Claude generates content, human provides images
const llmArgs = { title: "AI Development", content: "..." }; // from Claude
const humanArgs = { 
  images: [{ url: "user-uploaded-image.jpg", name: "hero" }] 
}; // from user

// Merge both parameter sets
const input = HttpLlm.mergeParameters({
  function: func,
  llm: llmArgs,
  human: humanArgs,
});

const result = await HttpLlm.execute({
  connection: { host: "https://your-api.com" },
  application,
  function: func,
  input,
});
```

## Complete Examples

### Shopping Assistant Example

Here's a complete example of a shopping assistant that creates product listings:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import {
  ClaudeTypeChecker,
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
} from "@samchon/openapi";

const createShoppingAssistant = async () => {
  // Load shopping API schema
  const swagger = await fetch(
    "https://raw.githubusercontent.com/samchon/shopping-backend/master/packages/api/swagger.json"
  ).then(r => r.json());

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

  // Find the product creation function
  const createProductFunc: IHttpLlmFunction<"claude"> | undefined =
    application.functions.find(
      f => f.path === "/shoppings/sellers/sale" && f.method === "post"
    );

  if (!createProductFunc) {
    throw new Error("Product creation function not found");
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // User describes a product
  const userPrompt = `
Create a product listing for:

**Microsoft Surface Pro 9**

The Surface Pro 9 is a versatile 2-in-1 device that combines the power of a laptop 
with the flexibility of a tablet. It features advanced technology, making it suitable 
for both professional and personal use.

Key features:
- Unleash Your Creativity Anywhere
- The Ultimate 2-in-1 Experience  
- Stay Connected with 5G
- Power Meets Flexibility

Available configurations:
- Intel Core i5, 16GB RAM, 256GB Storage: $1,399
- Intel Core i7, 32GB RAM, 512GB Storage: $1,899

Categories: electronics, laptops, 2in1_laptops
  `;

  // Claude generates the product data
  const completion = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    tools: [
      {
        name: createProductFunc.name,
        description: createProductFunc.description,
        input_schema: createProductFunc.separated!.llm as any,
      },
    ],
  });

  const toolCall = completion.content.find(c => c.type === "tool_use");

  // Human provides the product images
  const humanData = {
    content: {
      files: [],
      thumbnails: [
        {
          name: "surface-pro-9-main",
          extension: "jpeg", 
          url: "https://example.com/surface-pro-9-hero.jpg",
        },
        {
          name: "surface-pro-9-side",
          extension: "jpeg",
          url: "https://example.com/surface-pro-9-side.jpg", 
        },
      ],
    },
  };

  // Merge LLM and human parameters
  const mergedInput = HttpLlm.mergeParameters({
    function: createProductFunc,
    llm: toolCall.input as any,
    human: humanData,
  });

  // Execute the product creation
  const result = await HttpLlm.execute({
    connection: {
      host: "https://shopping-api.example.com",
      headers: {
        Authorization: "Bearer your-api-token",
      },
    },
    application,
    function: createProductFunc,
    input: mergedInput,
  });

  console.log("Product created:", result);
  return result;
};
```

### Model Context Protocol (MCP) Support

Use Claude with MCP servers for enhanced capabilities:

```typescript
import { McpLlm, IMcpLlmApplication, IMcpLlmFunction } from "@samchon/openapi";

const mcpApplication: IMcpLlmApplication<"claude"> = McpLlm.application({
  model: "claude",
  tools: [
    // Your MCP tool definitions
    {
      name: "github_search",
      description: "Search GitHub repositories",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          sort: { type: "string", enum: ["stars", "forks", "updated"] }
        },
        required: ["query"]
      }
    }
  ],
});

// Use with Claude the same way as HTTP functions
const func: IMcpLlmFunction<"claude"> = mcpApplication.functions[0];
const validation = func.validate({ query: "openapi typescript", sort: "stars" });
```

## Best Practices

### 1. Schema Design for Claude

Claude works best with clear, well-documented schemas:

```typescript
// ✅ Good: Clear descriptions and constraints
const goodSchema: IClaudeSchema = {
  type: "object", 
  properties: {
    title: {
      type: "string",
      description: "Blog post title (max 100 characters)",
      maxLength: 100
    },
    category: {
      type: "string", 
      enum: ["tech", "business", "lifestyle"],
      description: "Post category - must be one of the predefined options"
    },
    publishDate: {
      type: "string",
      format: "date-time", 
      description: "When to publish the post (ISO 8601 format)"
    }
  },
  required: ["title", "category"],
  additionalProperties: false
};

// ❌ Avoid: Vague descriptions and loose constraints  
const badSchema: IClaudeSchema = {
  type: "object",
  properties: {
    title: { type: "string" }, // No description or constraints
    stuff: { type: "object" }, // Too vague
    data: {} // No type information
  }
};
```

### 2. Error Handling

Always handle validation errors gracefully:

```typescript
const safeExecute = async (func: IHttpLlmFunction<"claude">, args: unknown) => {
  try {
    const validation = func.validate(args);
    
    if (!validation.success) {
      console.error("Validation failed:", validation.errors);
      return { error: "Invalid arguments", details: validation.errors };
    }

    const result = await HttpLlm.execute({
      connection: { host: "https://your-api.com" },
      application,
      function: func,
      input: validation.data,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Execution failed:", error);
    return { error: "Execution failed", details: error.message };
  }
};
```

### 3. Claude Model Selection

Choose the right Claude model for your use case:

```typescript
// For complex function calling with multiple parameters
const completion = await client.messages.create({
  model: "claude-3-5-sonnet-latest", // Best for complex reasoning
  max_tokens: 8192,
  // ...
});

// For simpler function calls
const completion = await client.messages.create({
  model: "claude-3-haiku-20240307", // Faster and cheaper
  max_tokens: 4096, 
  // ...
});
```

## Troubleshooting

### Common Issues

**1. Function not found**
```typescript
// Check available functions
console.log("Available functions:", application.functions.map(f => f.name));
```

**2. Validation errors**
```typescript
// Enable detailed validation logging
const validation = func.validate(args);
if (!validation.success) {
  validation.errors.forEach(error => {
    console.log(`Path: ${error.path}, Message: ${error.message}`);
  });
}
```

**3. Claude not using tools**
```typescript
// Ensure your prompt encourages tool usage
const messages = [
  {
    role: "user",
    content: "Please use the available tools to help me create a new blog post about TypeScript."
  }
];
```

## Resources

- **API Documentation**: [samchon.github.io/openapi/api](https://samchon.github.io/openapi/api/)
- **Claude-specific types**: [`IClaudeSchema`](https://samchon.github.io/openapi/api/types/IClaudeSchema-1.html)
- **Type checker**: [`ClaudeTypeChecker`](https://github.com/samchon/openapi/blob/master/src/utils/ClaudeTypeChecker.ts)
- **Example repository**: [samchon/shopping-backend](https://github.com/samchon/shopping-backend)
- **Discord community**: [samchon Discord](https://discord.gg/E94XhzrUCZ)

## Contributing

Found an issue or want to improve Claude support? 

1. Check existing issues: [github.com/samchon/openapi/issues](https://github.com/samchon/openapi/issues)
2. Submit a bug report or feature request
3. Contribute code via pull requests

---

Happy coding with Claude and `@samchon/openapi`! 🤖✨