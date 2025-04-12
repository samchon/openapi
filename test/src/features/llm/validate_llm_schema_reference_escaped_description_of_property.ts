import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_schema_reference_escaped_description_of_property =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_property("chatgpt");

export const test_claude_schema_reference_escaped_description_of_property =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_property("claude");

export const test_gemini_schema_reference_escaped_description_of_property =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_property("gemini");

export const test_llama_schema_reference_escaped_description_of_property =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_property("llama");

export const test_llm_v30_schema_reference_escaped_description_of_property =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_property("3.0");

export const test_llm_v31_schema_reference_escaped_description_of_property =
  (): void =>
    validate_llm_schema_reference_escaped_description_of_property("3.1");

const validate_llm_schema_reference_escaped_description_of_property = <
  Model extends ILlmSchema.Model,
>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<[IMember]>();
  const result = LlmSchemaComposer.parameters(model)({
    config: {
      reference: false,
    } as any,
    components: collection.components,
    schema: collection.schemas[0]! as OpenApi.IJsonSchema.IReference,
  });
  TestValidator.predicate("description")(
    result.success === true &&
      !!result.value.properties.hobby.description?.includes("A hobby") &&
      !!result.value.properties.hobby.description?.includes("The main hobby") &&
      !!result.value.properties.hobby.description?.includes("The hobby type"),
  );
};

interface IMember {
  id: string & tags.Format<"uuid">;
  name: string;
  age: number &
    tags.Type<"uint32"> &
    tags.Minimum<20> &
    tags.ExclusiveMaximum<100>;
  /**
   * A hobby.
   *
   * The main hobby.
   */
  hobby: IHobby;
}

/**
 * The hobby type.
 */
interface IHobby {
  name: string;
}
