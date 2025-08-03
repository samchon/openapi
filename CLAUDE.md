# `@samchon/openapi` for Claude
```mermaid
flowchart
  subgraph "OpenAPI Specification"
    v20("Swagger v2.0") --upgrades--> emended[["OpenAPI v3.1 (emended)"]]
    v30("OpenAPI v3.0") --upgrades--> emended
    v31("OpenAPI v3.1") --emends--> emended
  end
  subgraph "Claude Function Calling"
    emended --normalizes--> migration[["Migration Schema"]]
    migration --"Standard JSON Schema v3.1"--> claude("Claude")
    claude --validates--> validation{{"Validation"}}
    validation --executes--> api[["HTTP API"]]
  end
```

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/openapi/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@samchon/openapi.svg)](https://www.npmjs.com/package/@samchon/openapi)
[![Downloads](https://img.shields.io/npm/dm/@samchon/openapi.svg)](https://www.npmjs.com/package/@samchon/openapi)
[![Build Status](https://github.com/samchon/openapi/workflows/build/badge.svg)](https://github.com/samchon/openapi/actions?query=workflow%3Abuild)
[![API Documents](https://img.shields.io/badge/API-Documents-forestgreen)](https://samchon.github.io/openapi/api/)
[![Discord Badge](https://img.shields.io/badge/discord-samchon-d91965?style=flat&labelColor=5866f2&logo=discord&logoColor=white&link=https://discord.gg/E94XhzrUCZ)](https://discord.gg/E94XhzrUCZ)

OpenAPI to Claude function calling composer with standard JSON Schema support.

`@samchon/openapi` supports Anthropic Claude's function calling through standard OpenAPI v3.1 JSON Schema specification. Unlike other LLM providers that use custom schema formats, Claude follows the standard JSON Schema specification, making it highly compatible with existing OpenAPI documents.

## Installation
```bash
npm install @samchon/openapi
```

## Usage
```typescript
import {
  HttpLlm,
  IHttpLlmApplication,
  IHttpLlmFunction,
  OpenApi,
} from "@samchon/openapi";

// Convert OpenAPI document
const document: OpenApi.IDocument = OpenApi.convert(swagger);

// Create Claude application
const application: IHttpLlmApplication<"claude"> = HttpLlm.application({
  model: "claude",
  document,
});

// Use with Anthropic SDK
const func: IHttpLlmFunction<"claude"> = application.functions[0];
const completion = await anthropic.messages.create({
  model: "claude-3-5-sonnet-latest",
  tools: [{
    name: func.name,
    description: func.description,
    input_schema: func.parameters,
  }],
  // ...
});
```

## Features

### Standard JSON Schema
Claude supports OpenAPI v3.1 standard JSON Schema specification:

```typescript
const schema: IClaudeSchema = {
  type: "object",
  properties: {
    title: { 
      type: "string", 
      description: "Title of the content" 
    },
    tags: { 
      type: "array", 
      items: { type: "string" }
    }
  },
  required: ["title"],
  additionalProperties: false
};
```

### Validation
Built-in parameter validation with detailed error messages:

```typescript
const validation = func.validate(input);
if (!validation.success) {
  console.log("Validation errors:", validation.errors);
}
```

### Parameter Separation
Separate LLM parameters from human-provided data:

```typescript
const application: IHttpLlmApplication<"claude"> = HttpLlm.application({
  model: "claude",
  document,
  options: {
    separate: (schema) =>
      ClaudeTypeChecker.isString(schema) &&
      !!schema.contentMediaType?.startsWith("image"),
  },
});
```

## API References
- [`HttpLlm.application()`](https://samchon.github.io/openapi/api/functions/HttpLlm.application.html): Create Claude function calling application
- [`IHttpLlmApplication<"claude">`](https://samchon.github.io/openapi/api/interfaces/IHttpLlmApplication-1.html): Claude application interface
- [`IHttpLlmFunction<"claude">`](https://samchon.github.io/openapi/api/interfaces/IHttpLlmFunction-1.html): Claude function interface  
- [`IClaudeSchema`](https://samchon.github.io/openapi/api/types/IClaudeSchema-1.html): Claude JSON Schema type
- [`ClaudeTypeChecker`](https://github.com/samchon/openapi/blob/master/src/utils/ClaudeTypeChecker.ts): Claude schema type checking utilities