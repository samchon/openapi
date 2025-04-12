import { TestValidator } from "@nestia/e2e";
import {
  ILlmSchema,
  IOpenApiSchemaError,
  IResult,
  OpenApi,
} from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_parameters_separate_array = (): void =>
  validate_llm_parameters_separate_array("chatgpt", false);

export const test_claude_parameters_separate_array = (): void =>
  validate_llm_parameters_separate_array("claude", true);

export const test_gemini_parameters_separate_array = (): void =>
  validate_llm_parameters_separate_array("gemini", false);

export const test_llama_parameters_separate_array = (): void =>
  validate_llm_parameters_separate_array("llama", true);

export const test_llm_v30_parameters_separate_array = (): void => {
  validate_llm_parameters_separate_array("3.0", false);
  validate_llm_parameters_separate_array("3.0", true);
};

export const test_llm_v31_parameters_separate_array = (): void => {
  validate_llm_parameters_separate_array("3.1", false);
  validate_llm_parameters_separate_array("3.1", true);
};

const validate_llm_parameters_separate_array = <Model extends ILlmSchema.Model>(
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
          : s.description?.includes("@contentMediaType") === true),
      parameters: schema as any,
    });
  const member: ILlmSchema.IParameters<Model> = schema(
    model,
    constraint,
  )(typia.json.schemas<[IManagement<IMember>]>());
  const upload: ILlmSchema.IParameters<Model> = schema(
    model,
    constraint,
  )(typia.json.schemas<[IManagement<IFileUpload>]>());
  const combined: ILlmSchema.IParameters<Model> = schema(
    model,
    constraint,
  )(typia.json.schemas<[IManagement<ICombined>]>());

  TestValidator.equals(
    "member",
    (key) => key !== "description",
  )(separator(member))({
    llm: member,
    human: null,
  });
  TestValidator.equals(
    "upload",
    (key) => key !== "description",
  )(separator(upload))({
    llm: {
      type: "object",
      properties: {},
      additionalProperties: false,
      required: [],
      $defs: {},
    },
    human: upload,
  });
  TestValidator.equals(
    "combined",
    (key) => key !== "description",
  )(separator(combined))({
    llm: member,
    human: upload,
  });
};

interface IManagement<T> {
  profiles: T[];
}
interface IMember {
  id: number;
  name: string;
}
interface IFileUpload {
  file: string & tags.ContentMediaType<"image/png">;
}
interface ICombined extends IMember, IFileUpload {}

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
    if (result.success === false) {
      console.log(result.error);
      throw new Error("Invalid schema");
    }
    return result.value;
  };
