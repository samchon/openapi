import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, LlmTypeChecker } from "@samchon/openapi";
import { LlmSchemaSeparator } from "@samchon/openapi/lib/utils/LlmSchemaSeparator";

export const test_schema_separate_string = (): void => {
  const separator = LlmSchemaSeparator.schema(
    (s) => LlmTypeChecker.isString(s) && s.contentMediaType !== undefined,
  );
  const plain: ILlmSchema = { type: "string" };
  const upload: ILlmSchema = {
    type: "string",
    format: "uri",
    contentMediaType: "image/png",
  };
  TestValidator.equals("plain")(separator(plain))([plain, null]);
  TestValidator.equals("upload")(separator(upload))([null, upload]);
};
