import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_parameters_additionalProperties = (): void =>
  validate_llm_parameters_additionalProperties("chatgpt");

export const test_gemini_parameters_additionalProperties = (): void =>
  validate_llm_parameters_additionalProperties("gemini");

const validate_llm_parameters_additionalProperties = <
  Model extends "chatgpt" | "gemini",
>(
  model: Model,
): void => {
  const errors: string[] = [];
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      {
        first: string;
        second: number;
        third: Record<string, boolean>;
      },
    ]
  >();
  const parameters: ILlmSchema.IParameters<Model> | null =
    LlmSchemaComposer.parameters(model)({
      errors,
      accessor: "$input",
      config: LlmSchemaComposer.defaultConfig(
        model,
      ) satisfies ILlmSchema.IConfig<Model> as any,
      components: collection.components,
      schema: typia.assert<
        OpenApi.IJsonSchema.IReference | OpenApi.IJsonSchema.IObject
      >(collection.schemas[0]),
    }) as ILlmSchema.IParameters<Model> | null;
  TestValidator.equals("parameters")(parameters)(null);
  TestValidator.equals("errors")(
    errors.map((e) => e.split(":")[0].split(".").at(-1)),
  )([`additionalProperties`].sort());
};
