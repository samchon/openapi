import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi, OpenApiTypeChecker } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_invert_ref = (): void =>
  validate_llm_invert_ref("chatgpt");

export const test_claude_invert_ref = (): void =>
  validate_llm_invert_ref("claude");

export const test_llama_invert_ref = (): void =>
  validate_llm_invert_ref("llama");

export const test_llm_v31_invert_ref = (): void =>
  validate_llm_invert_ref("3.1");

const validate_llm_invert_ref = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<[IMember]>();
  const converted = LlmSchemaComposer.parameters(model)({
    config: {
      reference: true,
    } as any,
    components: collection.components,
    schema: collection.schemas[0] as OpenApi.IJsonSchema.IReference,
  });
  if (converted.success === false) throw new Error(converted.error.message);
  const inverted = LlmSchemaComposer.invert(model)({
    $defs: (converted.value as any).$defs,
    components: collection.components,
    schema: converted.value,
  } as any);
  TestValidator.predicate("inverted")(
    OpenApiTypeChecker.isObject(inverted) &&
      inverted.properties !== undefined &&
      OpenApiTypeChecker.isArray(inverted.properties.hobbies) &&
      OpenApiTypeChecker.isReference(inverted.properties.hobbies.items) &&
      inverted.properties.hobbies.items.$ref === "#/components/schemas/IHobby",
  );
};

interface IMember {
  id: string & tags.Format<"uuid">;
  email: string & tags.Format<"email">;
  name: string;
  hobbies: IHobby[] & tags.MaxItems<10>;
  thumbnail: string & tags.Format<"uri"> & tags.ContentMediaType<"image/png">;
}
interface IHobby {
  title: string;
  description: string;
}
