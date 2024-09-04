import { TestValidator } from "@nestia/e2e";
import { HttpLlm, ILlmSchema, LlmTypeChecker, OpenApi } from "@samchon/openapi";
import { LlmSchemaSeparator } from "@samchon/openapi/lib/utils/LlmSchemaSeparator";
import typia, { tags } from "typia";

export const test_llm_schema_separate_nested = (): void => {
  const separator = LlmSchemaSeparator.schema(
    (s) => LlmTypeChecker.isString(s) && s.contentMediaType !== undefined,
  );
  const member: ILlmSchema = schema(
    typia.json.application<[INested<IMember>]>(),
  );
  const upload: ILlmSchema = schema(
    typia.json.application<[INested<IFileUpload>]>(),
  );
  const combined: ILlmSchema = schema(
    typia.json.application<[INested<ICombined>]>(),
  );

  TestValidator.equals("member")(separator(member))([member, null]);
  TestValidator.equals("upload")(separator(upload))([null, upload]);
  TestValidator.equals("combined")(separator(combined))([member, upload]);
};

interface INested<T> {
  first: {
    second: {
      third: {
        fourth: T;
      };
      array: T[];
    };
  };
}
interface IMember {
  id: number;
  name: string;
}
interface IFileUpload {
  file: string & tags.Format<"uri"> & tags.ContentMediaType<"image/png">;
}
interface ICombined extends IMember, IFileUpload {}

const schema = (props: {
  components: OpenApi.IComponents;
  schemas: OpenApi.IJsonSchema[];
}): ILlmSchema => {
  const schema: ILlmSchema | null = HttpLlm.schema({
    components: props.components,
    schema: props.schemas[0],
  });
  if (schema === null) throw new Error("Invalid schema");
  return schema;
};
