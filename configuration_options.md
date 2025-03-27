---
title: Configuration Options
description: Detailed explanation of all configuration options available in @samchon/openapi, including LLM-specific configurations and their effects.
---

# Configuration Options

This document provides a comprehensive overview of the configuration options available in @samchon/openapi, with a focus on LLM-specific configurations and their effects on the application behavior.

## IHttpLlmApplication Options

The `IHttpLlmApplication` interface provides several configuration options that can be used to customize the behavior of the LLM application. These options are defined in the `IHttpLlmApplication.IOptions` interface.

### General Options

#### `maxLength`

- **Type**: `number`
- **Default**: `64`
- **Description**: Specifies the maximum length of function names. When a function name is longer than this value, it will be truncated. If truncation is not possible due to duplication, the function name will be modified to a randomly generated UUID v4.

### LLM-Specific Options

The `IHttpLlmApplication.IOptions` interface extends the `ILlmApplication.IOptions` interface, which includes model-specific configurations. The available options depend on the LLM model being used.

#### Model Selection

- **Type**: `ILlmSchema.Model`
- **Possible Values**: `"chatgpt"`, `"claude"`, `"gemini"`, `"llama"`, `"3.0"`, `"3.1"`
- **Description**: Specifies the target LLM model for the application.

#### Model-Specific Configurations

Each LLM model has its own configuration options. Here's an overview of the available configurations for each model:

##### ChatGPT (OpenAI)

```typescript
interface IChatGptSchema.IConfig {
  // Add ChatGPT-specific configuration options here
}
```

##### Claude (Anthropic)

```typescript
interface IClaudeSchema.IConfig {
  // Add Claude-specific configuration options here
}
```

##### Gemini (Google)

```typescript
interface IGeminiSchema.IConfig {
  // Add Gemini-specific configuration options here
}
```

##### LLaMA

```typescript
interface ILlamaSchema.IConfig {
  // Add LLaMA-specific configuration options here
}
```

##### OpenAPI v3.0

```typescript
interface ILlmSchemaV3.IConfig {
  // Add OpenAPI v3.0-specific configuration options here
}
```

##### OpenAPI v3.1

```typescript
interface ILlmSchemaV3_1.IConfig {
  // Add OpenAPI v3.1-specific configuration options here
}
```

## Parameter Separation

The `IHttpLlmApplication` interface allows for separation of function parameters between LLM and Human sides. This is particularly useful for handling sensitive information or file uploads that should not be processed by the LLM.

To configure parameter separation, use the `separate` property in the options object. The separated parameters will be assigned to the `IHttpLlmFunction.separated` property.

Example:

```typescript
const options: IHttpLlmApplication.IOptions<Model> = {
  // ... other options
  separate: {
    // Define parameters to be handled by humans
    humanParameters: ['secretKey', 'fileUpload'],
  },
};
```

## Function Execution

When executing functions with LLM-constructed arguments, use the `HttpLlm.execute` function. If you've configured parameter separation, you can merge the human and LLM sides' parameters using `HttpLlm.mergeParameters` before the actual function call execution.

Example:

```typescript
// Merge parameters if separation is configured
const mergedParams = HttpLlm.mergeParameters(llmParams, humanParams);

// Execute the function
const result = await HttpLlm.execute(functionName, mergedParams);
```

## Error Handling

The `IHttpLlmApplication` interface includes an `errors` property that contains a list of `IHttpLlmApplication.IError` objects. These errors represent issues that occurred during the composition of the LLM application.

Each error object includes:

- `method`: The HTTP method of the endpoint
- `path`: The path of the endpoint
- `messages`: An array of error messages
- `operation()`: A function to get the Swagger operation metadata
- `route()`: A function to get the migration route metadata (if available)

By examining these errors, you can identify and address issues in your API configuration or LLM application setup.

## Conclusion

Understanding and properly configuring the options available in @samchon/openapi is crucial for creating efficient and secure LLM applications. By leveraging these configuration options, you can customize the behavior of your application to meet your specific requirements and ensure smooth integration with various LLM models.