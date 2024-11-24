import { TestValidator } from "@nestia/e2e";
import { IChatGptSchema } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_schema_union_const = (): void => {
  const collection: IJsonSchemaCollection = typia.json.schemas<[IBbsArticle]>();
  const $defs: Record<string, IChatGptSchema> = {};
  const schema: IChatGptSchema | null = ChatGptConverter.schema({
    $defs,
    components: collection.components,
    schema: collection.schemas[0],
    config: {
      reference: false,
    },
  });
  TestValidator.equals("enum")(
    typia.assert<IChatGptSchema.IString>(
      typia.assert<IChatGptSchema.IObject>(schema).properties.format,
    ).enum,
  )(["html", "md", "txt"]);
};

interface IBbsArticle {
  format: IBbsArticle.Format;
  // title: string;
  // body: string;
}
namespace IBbsArticle {
  export type Format = "html" | "md" | "txt";
}
