import { TestValidator } from "@nestia/e2e";
import {
  IGeminiSchema,
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_enum = (): void =>
  validate_llm_schema_enum("chatgpt");

export const test_gemini_schema_enum = (): void =>
  validate_llm_schema_enum("gemini");

export const test_llm_v30_schema_enum = (): void =>
  validate_llm_schema_enum("3.0");

const validate_llm_schema_enum = <Model extends "chatgpt" | "gemini" | "3.0">(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<[IBbsArticle]>();
  const result: IResult<
    ILlmSchema<Model>,
    IOpenApiSchemaError
  > = LlmSchemaComposer.schema(model)({
    components: collection.components,
    schema: collection.schemas[0],
    config: LlmSchemaComposer.defaultConfig(model) as any,
    $defs: {},
  }) as IResult<ILlmSchema<Model>, IOpenApiSchemaError>;
  TestValidator.equals("success")(result.success);
  TestValidator.equals("enum")(
    typia.assert<IGeminiSchema.IString>(
      typia.assert<IGeminiSchema.IObject>(result.success ? result.value : {})
        .properties.format,
    ).enum,
  )(["html", "md", "txt"]);
};

interface IBbsArticle {
  format: IBbsArticle.Format;
  // title: string;
  // body: string;
}
namespace IBbsArticle {
  export type Format = "html" | "md" | "txt";
}
