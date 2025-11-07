import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_parameters_separate_object_additionalProperties =
  (): void =>
    validate_llm_parameters_separate_object_additionalProperties(
      "chatgpt",
      false,
    );

export const test_claude_parameters_separate_object_additionalProperties =
  (): void =>
    validate_llm_parameters_separate_object_additionalProperties(
      "claude",
      true,
    );

export const test_gemini_parameters_separate_object_additionalProperties =
  (): void =>
    TestValidator.error("Geimini does not support additionalProperties")(() =>
      validate_llm_parameters_separate_object_additionalProperties(
        "gemini",
        false,
      ),
    );

export const test_llm_v30_parameters_separate_object_additionalProperties =
  (): void => {
    validate_llm_parameters_separate_object_additionalProperties("3.0", false);
    validate_llm_parameters_separate_object_additionalProperties("3.0", true);
  };

export const test_llm_v31_parameters_separate_object_additionalProperties =
  (): void => {
    validate_llm_parameters_separate_object_additionalProperties("3.1", false);
    validate_llm_parameters_separate_object_additionalProperties("3.1", true);
  };

const validate_llm_parameters_separate_object_additionalProperties = <
  Model extends ILlmSchema.Model,
>(
  model: Model,
  constraint: boolean,
): void => {
  const separator = (schema: ILlmSchema.IParameters<Model>) =>
    LlmSchemaComposer.separateParameters(model)({
      predicate: (s) =>
        LlmSchemaComposer.typeChecker(model).isString(
          s as OpenApi.IJsonSchema.IString,
        ) &&
        (constraint
          ? (s as OpenApi.IJsonSchema.IString).contentMediaType !== undefined
          : (s as OpenApi.IJsonSchema.IString).description?.includes(
              "@contentMediaType",
            ) === true),
      parameters: schema as any,
    });
  const params: ILlmSchema.IParameters<Model> = schema(
    model,
    constraint,
  )(typia.json.schemas<[IParameters]>());
  TestValidator.equals(
    model,
    (key) => key !== "description",
  )(separator(params))({
    llm: schema(
      model,
      constraint,
    )(
      typia.json.schemas<
        [
          {
            input: {
              email: string;
              hobbies: Record<
                string,
                {
                  id: string;
                  name: string;
                }
              >;
            };
          },
        ]
      >(),
    ),
    human: schema(
      model,
      constraint,
    )(
      typia.json.schemas<
        [
          {
            input: {
              hobbies: Record<
                string,
                {
                  thumbnail: string &
                    tags.Format<"uri"> &
                    tags.ContentMediaType<"image/*">;
                }
              >;
            };
          },
        ]
      >(),
    ),
  });
};

interface IParameters {
  input: IMember;
}
interface IMember {
  email: string;
  hobbies: Record<string, IHobby>;
}
interface IHobby {
  id: string;
  name: string;
  thumbnail: string & tags.Format<"uri"> & tags.ContentMediaType<"image/*">;
}

const schema =
  <Model extends ILlmSchema.Model>(model: Model, constraint: boolean) =>
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
        constraint,
      } satisfies ILlmSchema.IConfig<Model> as any,
    }) as IResult<ILlmSchema.IParameters<Model>, IOpenApiSchemaError>;
    if (result.success === false) throw new Error("Invalid schema");
    return result.value;
  };
