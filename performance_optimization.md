# Performance Optimization

This guide provides tips and best practices for optimizing performance when using @samchon/openapi, particularly focusing on efficient use of LLM function calling and OpenAPI conversions.

## Table of Contents

1. [Efficient LLM Function Calling](#efficient-llm-function-calling)
2. [Optimizing OpenAPI Conversions](#optimizing-openapi-conversions)
3. [Caching Strategies](#caching-strategies)
4. [Minimizing Network Requests](#minimizing-network-requests)
5. [Handling Large Datasets](#handling-large-datasets)

## Efficient LLM Function Calling

When working with LLM function calling, consider the following optimization techniques:

### 1. Use Keyword Arguments

Set the `keyword` option to `true` in your `IHttpLlmApplication.IOptions` configuration. This allows LLMs to understand keyword arguments more easily, potentially improving performance:

```typescript
const options: Partial<IHttpLlmApplication.IOptions<Model>> = {
  keyword: true,
  // other options...
};
```

### 2. Separate Parameters

Utilize the `separate` option to split parameters into human and LLM sides. This can help in scenarios where you want to pre-process or validate certain parameters before sending them to the LLM:

```typescript
const options: Partial<IHttpLlmApplication.IOptions<Model>> = {
  separate: (schema) => {
    // Your separation logic here
    return true; // or false
  },
  // other options...
};
```

### 3. Merge Parameters Efficiently

When using separated parameters, merge them efficiently before execution:

```typescript
const mergedParams = HttpLlm.mergeParameters({
  function: llmFunction,
  llm: llmParams,
  human: humanParams,
});
```

## Optimizing OpenAPI Conversions

To optimize OpenAPI conversions, consider these strategies:

### 1. Use Emended OpenAPI v3.1

The `OpenApi` namespace provides an emended version of OpenAPI v3.1, which is optimized for use with `typia` and `nestia`. This version removes ambiguous and duplicated expressions, potentially improving performance:

```typescript
import { OpenApi } from "@samchon/openapi";

const emendedDocument = OpenApi.convert(originalDocument);
```

### 2. Minimize Schema Complexity

When defining your OpenAPI schemas, try to minimize complexity where possible. Simpler schemas are generally faster to process and convert.

### 3. Utilize Efficient Type Representations

Use the most efficient type representations in your schemas. For example, prefer using `oneOf` instead of `anyOf` for union types, as `OpenApi` automatically converts `anyOf` to `oneOf`:

```json
{
  "oneOf": [
    { "type": "string" },
    { "type": "number" }
  ]
}
```

## Caching Strategies

Implement caching strategies to reduce redundant computations:

### 1. Cache Converted Documents

If you frequently convert the same OpenAPI document, consider caching the result:

```typescript
const documentCache = new Map();

function getCachedDocument(key: string, document: any) {
  if (!documentCache.has(key)) {
    documentCache.set(key, OpenApi.convert(document));
  }
  return documentCache.get(key);
}
```

### 2. Cache LLM Applications

If you create LLM applications from the same OpenAPI document multiple times, consider caching the result:

```typescript
const appCache = new Map();

function getCachedApp<Model extends ILlmSchema.Model>(
  key: string,
  props: HttpLlm.IApplicationProps<Model>
) {
  if (!appCache.has(key)) {
    appCache.set(key, HttpLlm.application(props));
  }
  return appCache.get(key);
}
```

## Minimizing Network Requests

To minimize network requests and improve overall performance:

### 1. Batch Operations

When possible, batch multiple operations into a single request to reduce network overhead.

### 2. Use Efficient Content Types

Prefer efficient content types like `application/json` over `multipart/form-data` when possible, as the latter is not supported in LLM applications and can be less performant.

## Handling Large Datasets

When working with large datasets:

### 1. Use Pagination

Implement pagination in your API to handle large datasets efficiently. This can be done by adding query parameters for page number and page size:

```typescript
interface IPaginationQuery {
  page: number;
  size: number;
}
```

### 2. Streaming Responses

For very large datasets, consider implementing streaming responses to allow processing data as it arrives, rather than waiting for the entire response:

```typescript
async function* streamData(url: string) {
  const response = await fetch(url);
  const reader = response.body!.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}
```

By following these performance optimization strategies, you can improve the efficiency and responsiveness of your applications built with @samchon/openapi.