# `@samchon/openapi`

![Nestia Editor](https://github.com/samchon/openapi/assets/13158709/350128f7-c159-4ba4-8f8c-743908ada8eb)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/samchon/openapi/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@samchon/openapi.svg)](https://www.npmjs.com/package/@samchon/openapi)
[![Downloads](https://img.shields.io/npm/dm/@samchon/openapi.svg)](https://www.npmjs.com/package/@samchon/openapi)
[![Build Status](https://github.com/samchon/openapi/workflows/build/badge.svg)](https://github.com/samchon/openapi/actions?query=workflow%3Abuild)

OpenAPI definitions and converters for [typia](https://github.com/samchon/typia) and [nestia](https://github.com/samchon/nestia).

`@samchon/openapi` is a collection of OpenAPI definitions of below versions. Those type definitions does not contain every properties of OpenAPI specification, but just have only some features essentially required for `typia` and `nestia` (especially [`@nestia/editor`](https://nestia.io/docs/editor/)).

  1. [Swagger v2.0](https://github.com/samchon/openapi/blob/master/src/SwaggerV2.ts)
  2. [OpenAPI v3.0](https://github.com/samchon/openapi/blob/master/src/OpenApiV3.ts)
  3. [OpenAPI v3.1](https://github.com/samchon/openapi/blob/master/src/OpenApiV3_1.ts)

Also, `@samchon/openapi` provides emended OpenAPI v3.1 definition and its converter from above versions for convenient development. The keyword "emended" means that [`OpenApi`](https://github.com/samchon/openapi/blob/master/src/OpenApi.ts) is not a direct OpenAPI v3.1 specification (OpenApiV3_1), but a little bit shrinked to remove ambiguous and duplicated expressions of OpenAPI v3.1 for the convenience of typia and nestia

For example, when representing nullable type, OpenAPI v3.1 supports three ways. In that case, OpenApi remains only the third way, so that makes `typia` and `nestia` (especially [`@nestia/editor`](https://nestia.io/docs/editor/)) to be simple and easy to implement.

  - `{ type: ["string", "null"] }`
  - `{ type: "string", nullable: true }`
  - `{ oneOf: [{ type: "string" }, { type: "null" }] }`

Here is the entire list of differences between OpenAPI v3.1 and emended OpenApi.

  - Operation
    - Merged `OpenApiV3_1.IPathItem.parameters` to `OpenApi.IOperation.parameters`
    - Resolved references of `OpenApiV3_1.IOperation` mebers
  - JSON Schema
    - Decomposed mixed type: `OpenApiV3_1.IJsonSchema.IMixed`
    - Resolved nullable property: `OpenApiV3_1.IJsonSchema.__ISignificant.nullable`
    - Array type utilizes only single `OpenAPI.IJsonSchema.IArray.items`
    - Tuple type utilizes only `OpenApi.IJsonSchema.ITuple.prefixItems`
    - Merged `OpenApiV3_1.IJsonSchema.IAnyOf` to `OpenApi.IJsonSchema.IOneOf`
    - Merged `OpenApiV3_1.IJsonSchema.IRecursiveReference` to `OpenApi.IJsonSchema.IReference`



## How to use
```bash
npm install @samchon/openapi
```

```typescript
import { OpenApi, SwaggerV2, OpenApiV3, OpenApiV3_1 } from "@samchon/openapi";

// original Swagger/OpenAPI document
const input: 
  | SwaggerV2.IDocument
  | OpenApiV3.IDocument
  | OpenApiV3_1.IDocument = { ... };

// you can convert it to emended OpenAPI v3.1
const output: OpenApi.IDocument = OpenApi.convert(input);
```



## Related Projects
  - `typia`: https://github.com/samchon/typia
  - `nestia`: https://github.com/samchon/nestia
  - `@nestia/editor`: https://nestia.io/docs/editor