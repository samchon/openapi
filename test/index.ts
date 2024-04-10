import typia from "typia";

import { OpenApi, OpenApiV3, OpenApiV3_1, SwaggerV2 } from "../src";
import v2 from "../examples/swaggerv2.0.json";
import v3 from "../examples/openapiv3.0.json";
import v3_1 from "../examples/openapiv3.1.json";

console.log("Test OpenAPI conversion");

function validate(
  document: SwaggerV2.IDocument | OpenApiV3.IDocument | OpenApiV3_1.IDocument,
): void {
  console.log(
    "  - ",
    SwaggerV2.is(document)
      ? "Swagger v2.0"
      : document.openapi.startsWith("3.0")
        ? "OpenAPI v3.0"
        : "OpenAPI v3.1",
  );
  console.log("    - type assertion");
  typia.assert(document);

  console.log("    - conversion");
  typia.assert(OpenApi.convert(document));
}
validate(v2 as any);
validate(v3 as any);
validate(v3_1 as any);
