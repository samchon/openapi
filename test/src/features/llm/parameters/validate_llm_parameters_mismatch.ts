import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_parameters_mismatch = (): void =>
  validate_llm_parameters_mismatch("chatgpt");

export const test_claude_parameters_mismatch = (): void =>
  validate_llm_parameters_mismatch("claude");

export const test_gemini_parameters_mismatch = (): void =>
  validate_llm_parameters_mismatch("gemini");

export const test_llm_v30_parameters_mismatch = (): void =>
  validate_llm_parameters_mismatch("3.0");

export const test_llm_v31_parameters_mismatch = (): void =>
  validate_llm_parameters_mismatch("3.1");

const validate_llm_parameters_mismatch = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      {
        first: IPoint;
        second: {
          input: ICircle;
        };
        third: Array<{
          nested: IRectangle;
        }>;
      },
    ]
  >();
  const p = typia.assert<OpenApi.IJsonSchema.IObject>(collection.schemas[0])
    .properties as any;
  p.first.$ref = "#/components/schemas/IPoint1";
  p.second.properties.input.$ref = "#/components/schemas/ICircle1";
  p.third.items.properties.nested.$ref = "#/components/schemas/IRectangle1";

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
  TestValidator.equals("success")(result.success)(false);
  TestValidator.equals("errors")(
    result.success ? [] : result.error.reasons.map((r) => r.accessor).sort(),
  )(
    [
      `$input.properties["first"]`,
      `$input.properties["second"].properties["input"]`,
      `$input.properties["third"].items.properties["nested"]`,
    ].sort(),
  );
};

interface IPoint {
  x: number;
  y: number;
}
interface ICircle {
  radius: number;
  center: IPoint;
}
interface IRectangle {
  p1: IPoint;
  p2: IPoint;
}
