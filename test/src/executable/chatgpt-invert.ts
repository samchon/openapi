import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { tags } from "typia";

for (const model of ["chatgpt", "gemini", "llama", "3.0", "3.1"] as const) {
  const invert = LlmSchemaComposer.invert(model)({
    components: {},
    $defs: {},
    schema: typia.llm.schema<string & tags.Format<"uuid">, "chatgpt">({}),
  } as any);
  console.log(invert);
}
