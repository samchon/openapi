import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_invert_nullable = (): void =>
  validate_llm_invert_nullable("chatgpt");

export const test_claude_invert_nullable = (): void =>
  validate_llm_invert_nullable("claude");

export const test_deepseek_invert_nullable = (): void =>
  validate_llm_invert_nullable("deepseek");

export const test_gemini_invert_nullable = (): void =>
  validate_llm_invert_nullable("gemini");

export const test_llama_invert_nullable = (): void =>
  validate_llm_invert_nullable("llama");

export const test_llm_v30_invert_nullable = (): void =>
  validate_llm_invert_nullable("3.0");

export const test_llm_v31_invert_nullable = (): void =>
  validate_llm_invert_nullable("3.1");

const validate_llm_invert_nullable = <Model extends ILlmSchema.Model>(
  model: Model,
): void => {
  const validate = (collection: IJsonSchemaCollection) => {
    const $defs: Record<string, ILlmSchema<Model>> = {};
    const converted = LlmSchemaComposer.schema(model)({
      components: collection.components,
      schema: collection.schemas[0],
      config: LlmSchemaComposer.defaultConfig(model) as any,
      $defs: $defs as any,
    });
    if (converted.success === false) throw new Error(converted.error.message);
    const inverted = LlmSchemaComposer.invert(model)({
      $defs,
      components: collection.components,
      schema: converted.value,
    } as any);
    TestValidator.equals(
      "inverted",
      (key) => key !== "description",
    )(collection.schemas[0])(inverted);
  };
  validate(typia.json.schemas<[boolean | null]>());
  validate(
    typia.json.schemas<
      [
        | (number &
            tags.ExclusiveMinimum<0> &
            tags.Maximum<100> &
            tags.MultipleOf<5>)
        | null,
      ]
    >(),
  );
  validate(
    typia.json.schemas<
      [
        | (string &
            tags.Format<"uri"> &
            tags.ContentMediaType<"image/png"> &
            tags.MinLength<5>)
        | null,
      ]
    >(),
  );
  validate(
    typia.json.schemas<
      [(Array<number> & tags.MinItems<1> & tags.MaxItems<10>) | null]
    >(),
  );
  validate(
    typia.json.schemas<
      [
        {
          /**
           * Primary Key.
           */
          id: string & tags.Format<"uuid">;

          /**
           * Email Address.
           */
          email: string & tags.Format<"email">;
          name: string;
          age: null | (number & tags.Minimum<0> & tags.Maximum<100>);
          hobbies: Array<{
            title: string;
            description: string;
          }>;
        } | null,
      ]
    >(),
  );
};
