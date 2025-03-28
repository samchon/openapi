import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_parameters_reference_escaped_description_of_name =
  (): void =>
    validate_llm_parameters_reference_escaped_description_of_name("chatgpt");

export const test_claude_parameters_reference_escaped_description_of_name =
  (): void =>
    validate_llm_parameters_reference_escaped_description_of_name("claude");

export const test_gemini_parameters_reference_escaped_description_of_name =
  (): void =>
    validate_llm_parameters_reference_escaped_description_of_name("gemini");

export const test_llama_parameters_reference_escaped_description_of_name =
  (): void =>
    validate_llm_parameters_reference_escaped_description_of_name("llama");

export const test_llm_v30_parameters_reference_escaped_description_of_name =
  (): void =>
    validate_llm_parameters_reference_escaped_description_of_name("3.0");

export const test_llm_v31_parameters_reference_escaped_description_of_name =
  (): void =>
    validate_llm_parameters_reference_escaped_description_of_name("3.1");

const validate_llm_parameters_reference_escaped_description_of_name = <
  Model extends ILlmSchema.Model,
>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<[Something.INested.IDeep]>();
  const deep: ILlmSchema.IParameters<Model> = composeSchema(model)(collection);
  TestValidator.predicate("description")(
    () => !!deep.description?.includes("Something.INested.IDeep"),
  );
};

interface Something {
  x: number;
}
namespace Something {
  export interface INested {
    y: number;
  }
  export namespace INested {
    export interface IDeep {
      z: number;
    }
  }
}

const composeSchema =
  <Model extends ILlmSchema.Model>(model: Model) =>
  (collection: IJsonSchemaCollection): ILlmSchema.IParameters<Model> => {
    const result: IResult<
      ILlmSchema.IParameters<Model>,
      IOpenApiSchemaError
    > = LlmSchemaComposer.parameters(model)({
      components: collection.components,
      schema: typia.assert<
        OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference
      >(collection.schemas[0]),
      config: {
        ...LlmSchemaComposer.defaultConfig(model),
        reference: false,
      } satisfies ILlmSchema.IConfig<Model> as any,
    }) as IResult<ILlmSchema.IParameters<Model>, IOpenApiSchemaError>;
    if (result.success === false) throw new Error("Invalid schema");
    return result.value;
  };
