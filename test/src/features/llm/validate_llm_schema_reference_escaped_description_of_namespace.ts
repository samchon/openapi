import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_reference_escaped_description_of_namespace =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_namespace("chatgpt");

export const test_claude_schema_reference_escaped_description_of_namespace =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_namespace("claude");

export const test_deepseek_schema_reference_escaped_description_of_namespace =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_namespace("deepseek");

export const test_gemini_schema_reference_escaped_description_of_namespace =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_namespace("gemini");

export const test_llama_schema_reference_escaped_description_of_namespace =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_namespace("llama");

export const test_llm_v30_schema_reference_escaped_description_of_namespace =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_namespace("3.0");

export const test_llm_v31_schema_reference_escaped_description_of_namespace =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_namespace("3.1");

const validate_llm_schema_reference_escaped_description_of_namespace = <
  Model extends ILlmSchema.Model,
>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      {
        deep: Something.INested.IDeep;
        nested: Something.INested;
        something: Something;
      },
    ]
  >();
  const schema: ILlmSchema.IParameters<Model> =
    composeSchema(model)(collection);
  const deep: ILlmSchema<Model> = schema.properties.deep as ILlmSchema<Model>;
  TestValidator.predicate("description")(
    () =>
      !!deep.description &&
      deep.description.includes("Something interface") &&
      deep.description.includes("Something nested interface") &&
      deep.description.includes("Something nested and deep interface"),
  );
};

/**
 * Something interface.
 */
interface Something {
  x: number;
}
namespace Something {
  /**
   * Something nested interface.
   */
  export interface INested {
    y: number;
  }
  export namespace INested {
    /**
     * Something nested and deep interface.
     */
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
