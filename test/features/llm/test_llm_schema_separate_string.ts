import { TestValidator } from "@nestia/e2e";
import { ILlmSchemaV3, LlmTypeCheckerV3 } from "@samchon/openapi";
import { LlmConverterV3 } from "@samchon/openapi/lib/converters/LlmConverterV3";

export const test_schema_separate_string = (): void => {
  const separator = (schema: ILlmSchemaV3) =>
    LlmConverterV3.separate({
      predicate: (s) =>
        LlmTypeCheckerV3.isString(s) && s.contentMediaType !== undefined,
      schema,
    });
  const plain: ILlmSchemaV3 = { type: "string" };
  const upload: ILlmSchemaV3 = {
    type: "string",
    format: "uri",
    contentMediaType: "image/png",
  };
  TestValidator.equals(
    "plain",
    (key) => key === "additionalProperties",
  )(separator(plain))([plain, null]);
  TestValidator.equals(
    "upload",
    (key) => key === "additionalProperties",
  )(separator(upload))([null, upload]);
};
