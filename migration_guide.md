# HttpMigration Guide

## Introduction

The `HttpMigration` module is designed to help developers compose HTTP migration applications from OpenAPI documents. It's particularly useful for OpenAPI generator libraries that convert OpenAPI operations to Remote Procedure Call (RPC) functions. This guide will walk you through the key features and usage of the `HttpMigration` module.

## Key Features

1. **Application Composition**: Convert OpenAPI documents to HTTP migration applications.
2. **Request Execution**: Execute HTTP requests and handle responses.
3. **Request Propagation**: Propagate HTTP requests and retrieve detailed response information.

## Converting OpenAPI Documents

The `HttpMigration.application()` function is the core feature of this module. It converts an OpenAPI document into an `IHttpMigrateApplication` object.

```typescript
import { HttpMigration } from './HttpMigration';
import { OpenApi } from './OpenApi';

const document: OpenApi.IDocument = // ... your OpenAPI document
const application = HttpMigration.application(document);
```

The resulting `application` object contains:

- `routes`: An array of `IHttpMigrateRoute` objects representing the migrated API routes.
- `errors`: An array of migration errors, if any occurred during the process.
- `document`: A function that returns the original OpenAPI document.

## Normalization Rules

The `HttpMigration` module applies the following normalization rules when converting OpenAPI operations:

1. Path parameters are separated to the atomic level.
2. Query parameters are combined into a single object.
3. Header parameters are combined into a single object.
4. Only specific HTTP methods are allowed: `head`, `get`, `post`, `put`, `patch`, `delete`.
5. Only specific content media types are allowed: `application/json`, `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`.

## Executing HTTP Requests

To execute an HTTP request, use the `HttpMigration.execute()` function:

```typescript
import { HttpMigration } from './HttpMigration';

const response = await HttpMigration.execute({
  connection: // ... IHttpConnection object
  route: // ... IHttpMigrateRoute object
  parameters: // ... path parameters
  query: // ... query parameters (optional)
  body: // ... request body (optional)
});
```

This function returns the response body for successful requests (status 200 or 201) or throws an `HttpError` for other status codes.

## Propagating HTTP Requests

For more detailed response information, use the `HttpMigration.propagate()` function:

```typescript
import { HttpMigration } from './HttpMigration';

const response = await HttpMigration.propagate({
  connection: // ... IHttpConnection object
  route: // ... IHttpMigrateRoute object
  parameters: // ... path parameters
  query: // ... query parameters (optional)
  body: // ... request body (optional)
});
```

This function returns an `IHttpResponse` object containing status code, headers, and response body, regardless of the status code.

## Error Handling

The `HttpMigration` module provides robust error handling:

- `HttpMigration.execute()` throws an `HttpError` for non-200/201 status codes.
- `HttpMigration.propagate()` returns response information for all status codes but may throw an `Error` if the connection fails.
- Migration errors are stored in the `errors` array of the `IHttpMigrateApplication` object.

## Best Practices

1. Always check the `errors` array in the `IHttpMigrateApplication` object to ensure all operations were migrated successfully.
2. Use `HttpMigration.execute()` for simple request-response scenarios and `HttpMigration.propagate()` when you need more detailed response information.
3. Implement proper error handling, especially when using `HttpMigration.execute()`.

By following this guide, you should be able to effectively use the `HttpMigration` module to migrate between different OpenAPI versions and perform HTTP operations in your applications.