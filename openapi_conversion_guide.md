# OpenAPI Conversion Guide

This guide explains how to use `@samchon/openapi` to convert between different OpenAPI/Swagger versions and the emended OpenAPI v3.1 format.

## Introduction

`@samchon/openapi` provides utilities to convert between various OpenAPI/Swagger versions and an emended OpenAPI v3.1 format. The emended format is a slightly modified version of OpenAPI v3.1 that removes ambiguous and duplicated expressions for better compatibility with `typia` and `nestia`.

## Converting to Emended OpenAPI v3.1

To convert any Swagger or OpenAPI document to the emended OpenAPI v3.1 format, use the `OpenApi.convert()` function:

```typescript
import { OpenApi } from "@samchon/openapi";

const convertedDocument = OpenApi.convert(inputDocument);
```

This function accepts input documents in the following formats:
- Swagger v2.0
- OpenAPI v3.0
- OpenAPI v3.1
- Emended OpenAPI v3.1

The output is always an emended OpenAPI v3.1 document.

## Downgrading from Emended OpenAPI v3.1

To downgrade an emended OpenAPI v3.1 document to earlier versions, use the `OpenApi.downgrade()` function:

```typescript
import { OpenApi } from "@samchon/openapi";

// Downgrade to Swagger v2.0
const swaggerDocument = OpenApi.downgrade(emendedDocument, "2.0");

// Downgrade to OpenAPI v3.0
const openApiV3Document = OpenApi.downgrade(emendedDocument, "3.0");
```

## Key Differences in Emended OpenAPI v3.1

The emended OpenAPI v3.1 format differs from the standard OpenAPI v3.1 in the following ways:

1. Operation changes:
   - Merges `OpenApiV3_1.IPath.parameters` into `OpenApi.IOperation.parameters`
   - Resolves references of `OpenApiV3_1.IOperation` members
   - Escapes references of `OpenApiV3_1.IComponents.examples`

2. JSON Schema changes:
   - Decomposes mixed type: `OpenApiV3_1.IJsonSchema.IMixed`
   - Resolves nullable property: `OpenApiV3_1.IJsonSchema.__ISignificant.nullable`
   - Array type uses only single `OpenApi.IJsonSchema.IArray.items`
   - Tuple type uses only `OpenApi.IJsonSchema.ITuple.prefixItems`
   - Merges `OpenApiV3_1.IJsonSchema.IAllOf` into `OpenApi.IJsonSchema.IObject`
   - Merges `OpenApiV3_1.IJsonSchema.IAnyOf` into `OpenApi.IJsonSchema.IOneOf`
   - Merges `OpenApiV3_1.IJsonSchema.IRecursiveReference` into `OpenApi.IJsonSchema.IReference`

## Conversion Process

The conversion process involves the following steps:

1. For OpenAPI v3.0 to v3.1 conversion:
   - Use `OpenApiV3Upgrader.convert()`
   - This handles the differences between v3.0 and v3.1, such as the changes in the `nullable` property and the introduction of the `oneOf` keyword

2. For OpenAPI v3.1 to emended v3.1 conversion:
   - Use `OpenApiV3_1Emender.convert()`
   - This applies the emendations specific to `@samchon/openapi`, such as resolving references and simplifying schema structures

3. For Swagger v2.0 to emended OpenAPI v3.1 conversion:
   - Use `SwaggerV2Upgrader.convert()`
   - This handles the conversion from Swagger v2.0 to OpenAPI v3.0 format, and then applies the v3.0 to v3.1 and emendation steps

## Best Practices

1. Always validate your input document before conversion to ensure it's a valid Swagger/OpenAPI specification.
2. After conversion, review the output document to ensure all information has been properly translated, especially complex schemas and nested structures.
3. Be aware of the limitations of downgrading, as some features in newer versions may not have direct equivalents in older versions.
4. When working with the emended format, remember that it's specifically designed for use with `typia` and `nestia`. Standard OpenAPI tooling may not fully support all aspects of the emended format.

## Conclusion

The `@samchon/openapi` library provides powerful tools for converting between different OpenAPI/Swagger versions and an emended OpenAPI v3.1 format. By understanding the conversion process and the differences in the emended format, you can effectively manage your API specifications across different tools and versions.