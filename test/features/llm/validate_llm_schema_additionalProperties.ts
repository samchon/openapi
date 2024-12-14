import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_additionalProperties = (): void =>
  validate_llm_schema_additionalProperties("chatgpt");

export const test_gemini_schema_additionalProperties = (): void =>
  validate_llm_schema_additionalProperties("gemini");

const validate_llm_schema_additionalProperties = <
  Model extends "chatgpt" | "gemini",
>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      {
        first: string;
        second: number;
        third: Record<string, boolean>;
      },
    ]
  >();
  const result: IResult<
    ILlmSchema.IParameters<Model>,
    IOpenApiSchemaError
  > = LlmSchemaComposer.parameters(model)({
    accessor: "$input",
    config: {
      ...LlmSchemaComposer.defaultConfig(model),
      strict: true,
    } satisfies ILlmSchema.IConfig<Model> as any,
    components: collection.components,
    schema: typia.assert<
      OpenApi.IJsonSchema.IReference | OpenApi.IJsonSchema.IObject
    >(collection.schemas[0]),
  }) as IResult<ILlmSchema.IParameters<Model>, IOpenApiSchemaError>;
  TestValidator.equals("success")(result.success)(false);
  TestValidator.equals("errors")(
    result.success
      ? []
      : result.error.reasons.map((r) => r.accessor.split(".").at(-1)),
  )([`additionalProperties`].sort());
};
