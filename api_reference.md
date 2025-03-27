# API Reference for @samchon/openapi

This document provides a comprehensive API reference for the `@samchon/openapi` package, including all public namespaces, interfaces, and functions, along with descriptions and usage examples.

## Table of Contents

1. [OpenApi Namespace](#openapi-namespace)
2. [HttpLlm Namespace](#httpllm-namespace)
3. [HttpMigration Namespace](#httpmigration-namespace)
4. [Interfaces](#interfaces)
5. [Types](#types)

## OpenApi Namespace

The `OpenApi` namespace contains functions and interfaces for working with OpenAPI specifications.

### Functions

#### `convert(input: SwaggerV2.IDocument | OpenApiV3.IDocument | OpenApiV3_1.IDocument | OpenApi.IDocument): IDocument`

Converts Swagger or OpenAPI documents into an emended OpenAPI v3.1 document.

```typescript
import { OpenApi } from "@samchon/openapi";

const swaggerDocument = // ... load Swagger document
const openApiDocument = OpenApi.convert(swaggerDocument);
```

#### `downgrade(document: IDocument, version: "2.0" | "3.0"): SwaggerV2.IDocument | OpenApiV3.IDocument`

Downgrades an emended OpenAPI v3.1 document to Swagger v2.0 or OpenAPI v3.0.

```typescript
import { OpenApi } from "@samchon/openapi";

const openApiV31Document = // ... load OpenAPI v3.1 document
const swaggerV2Document = OpenApi.downgrade(openApiV31Document, "2.0");
```

### Interfaces

#### `IDocument`

Represents an emended OpenAPI v3.1 document.

```typescript
interface IDocument {
  openapi: `3.1.${number}`;
  servers?: IServer[];
  info?: IDocument.IInfo;
  components: IComponents;
  paths?: Record<string, IPath>;
  webhooks?: Record<string, IPath>;
  security?: Record<string, string[]>[];
  tags?: IDocument.ITag[];
  "x-samchon-emended": true;
}
```

For a complete list of interfaces and their properties, refer to the source code.

## HttpLlm Namespace

The `HttpLlm` namespace provides functionality for working with Large Language Models (LLMs) and OpenAPI specifications.

### Functions

#### `application<Model extends ILlmSchema.Model>(props: IApplicationProps<Model>): IHttpLlmApplication<Model>`

Converts an OpenAPI document to an LLM function calling application.

```typescript
import { HttpLlm, OpenApi } from "@samchon/openapi";

const openApiDocument = // ... load OpenAPI document
const llmApplication = HttpLlm.application({
  model: "gpt-3.5-turbo",
  document: openApiDocument,
  options: {
    separate: true,
    maxLength: 1000
  }
});
```

#### `execute<Model extends ILlmSchema.Model>(props: IFetchProps<Model>): Promise<unknown>`

Executes an LLM function call.

```typescript
import { HttpLlm } from "@samchon/openapi";

const result = await HttpLlm.execute({
  application: llmApplication,
  function: llmFunction,
  connection: httpConnection,
  input: functionArguments
});
```

#### `propagate<Model extends ILlmSchema.Model>(props: IFetchProps<Model>): Promise<IHttpResponse>`

Propagates an LLM function call and returns the full HTTP response.

```typescript
import { HttpLlm } from "@samchon/openapi";

const response = await HttpLlm.propagate({
  application: llmApplication,
  function: llmFunction,
  connection: httpConnection,
  input: functionArguments
});
```

#### `mergeParameters<Model extends ILlmSchema.Model>(props: IMergeProps<Model>): object`

Merges parameters from human and LLM sources.

```typescript
import { HttpLlm } from "@samchon/openapi";

const mergedParams = HttpLlm.mergeParameters({
  function: llmFunction,
  llm: llmGeneratedParams,
  human: humanProvidedParams
});
```

## HttpMigration Namespace

The `HttpMigration` namespace provides functionality for migrating OpenAPI documents and executing HTTP requests.

### Functions

#### `application(document: OpenApi.IDocument | SwaggerV2.IDocument | OpenApiV3.IDocument | OpenApiV3_1.IDocument): IHttpMigrateApplication`

Converts an OpenAPI document to an HTTP migration application.

```typescript
import { HttpMigration } from "@samchon/openapi";

const openApiDocument = // ... load OpenAPI document
const migrateApplication = HttpMigration.application(openApiDocument);
```

#### `execute(props: IFetchProps): Promise<unknown>`

Executes an HTTP request and returns the response body for successful status codes.

```typescript
import { HttpMigration } from "@samchon/openapi";

const result = await HttpMigration.execute({
  connection: httpConnection,
  route: migrateRoute,
  parameters: routeParameters,
  query: queryParameters,
  body: requestBody
});
```

#### `propagate(props: IFetchProps): Promise<IHttpResponse>`

Propagates an HTTP request and returns the full HTTP response.

```typescript
import { HttpMigration } from "@samchon/openapi";

const response = await HttpMigration.propagate({
  connection: httpConnection,
  route: migrateRoute,
  parameters: routeParameters,
  query: queryParameters,
  body: requestBody
});
```

## Interfaces

The package includes various interfaces for working with OpenAPI specifications, HTTP requests, and LLM integrations. Some key interfaces include:

- `IHttpConnection`
- `IHttpLlmApplication`
- `IHttpLlmFunction`
- `IHttpMigrateApplication`
- `IHttpMigrateRoute`
- `IHttpResponse`
- `ILlmFunction`
- `ILlmSchema`

For detailed information on these interfaces and their properties, refer to the source code.

## Types

The package defines several types to enhance type safety and provide better autocompletion. Some important types include:

- `OpenApi.Method`
- `OpenApi.IJsonSchema`
- `OpenApi.ISecurityScheme`

For a complete list of types and their definitions, refer to the source code.

This API reference provides an overview of the main components of the `@samchon/openapi` package. For more detailed information and advanced usage, please refer to the source code and any additional documentation provided with the package.