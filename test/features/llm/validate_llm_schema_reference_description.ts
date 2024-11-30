import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_reference_description = (): void =>
  validate_llm_schema_reference_description("chatgpt");

export const test_claude_schema_reference_description = (): void =>
  validate_llm_schema_reference_description("claude");

export const test_gemini_schema_reference_description = (): void =>
  validate_llm_schema_reference_description("gemini");

export const test_llama_schema_reference_description = (): void =>
  validate_llm_schema_reference_description("llama");

export const test_llm_v30_schema_reference_description = (): void =>
  validate_llm_schema_reference_description("3.0");

export const test_llm_v31_schema_reference_description = (): void =>
  validate_llm_schema_reference_description("3.1");

const validate_llm_schema_reference_description = <
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
    const schema: ILlmSchema.IParameters<Model> | null =
      LlmSchemaComposer.parameters(model)({
        components: collection.components,
        schema: typia.assert<
          OpenApi.IJsonSchema.IObject | OpenApi.IJsonSchema.IReference
        >(collection.schemas[0]),
        config: {
          ...LlmSchemaComposer.defaultConfig(model),
          reference: false,
        } satisfies ILlmSchema.IConfig<Model> as any,
      }) as ILlmSchema.IParameters<Model> | null;
    if (schema === null) throw new Error("Invalid schema");
    return schema;
  };
