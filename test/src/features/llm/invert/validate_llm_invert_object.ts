import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_invert_object = (): void =>
  validate_llm_invert_object("chatgpt");

export const test_claude_invert_object = (): void =>
  validate_llm_invert_object("claude");

export const test_gemini_invert_object = (): void =>
  validate_llm_invert_object("gemini");

export const test_llm_v30_invert_object = (): void =>
  validate_llm_invert_object("3.0");

export const test_llm_v31_invert_object = (): void =>
  validate_llm_invert_object("3.1");

const validate_llm_invert_object = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<
    [
      {
        id: string & tags.Format<"uuid">;
        email: string & tags.Format<"email">;
        name: string;
        hobbies: Array<{
          title: string;
          description: string;
        }> &
          tags.MaxItems<10>;
        thumbnail: string &
          tags.Format<"uri"> &
          tags.ContentMediaType<"image/png">;
      },
    ]
  >();
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
  TestValidator.equals(
    "inverted",
    (key) => key !== "description",
  )(collection.schemas[0])(inverted);
};
