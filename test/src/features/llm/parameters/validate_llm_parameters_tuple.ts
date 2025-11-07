import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_parameters_tuple = (): void =>
  validate_llm_parameters_tuple("chatgpt");

export const test_claude_parameters_tuple = (): void =>
  validate_llm_parameters_tuple("claude");

export const test_gemini_parameters_tuple = (): void =>
  validate_llm_parameters_tuple("gemini");

export const test_llm_v30_parameters_tuple = (): void =>
  validate_llm_parameters_tuple("3.0");

export const test_llm_v31_parameters_tuple = (): void =>
  validate_llm_parameters_tuple("3.1");

const validate_llm_parameters_tuple = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      {
        first: [string, number];
        second: {
          input: {
            schema: [boolean, string];
          };
          output: [number, boolean];
        };
        third: Array<[number]>;
      },
    ]
  >();
  const result: IResult<
    ILlmSchema.IParameters<Model>,
    IOpenApiSchemaError
  > = LlmSchemaComposer.parameters(model)({
    accessor: "$input",
    config: LlmSchemaComposer.defaultConfig(
      model,
    ) satisfies ILlmSchema.IConfig<Model> as any,
    components: collection.components,
    schema: typia.assert<
      OpenApi.IJsonSchema.IReference | OpenApi.IJsonSchema.IObject
    >(collection.schemas[0]),
  }) as IResult<ILlmSchema.IParameters<Model>, IOpenApiSchemaError>;
  TestValidator.equals("parameters")(result.success)(false);
  TestValidator.equals("errors")(
    result.success ? [] : result.error.reasons.map((r) => r.accessor).sort(),
  )(
    [
      `$input.properties["first"]`,
      `$input.properties["second"].properties["input"].properties["schema"]`,
      `$input.properties["second"].properties["output"]`,
      `$input.properties["third"].items`,
    ].sort(),
  );
};
