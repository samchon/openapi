import { TestValidator } from "@nestia/e2e";
import { IChatGptSchema } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_schema_anyof = (): void => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<[IPoint | ILine | ITriangle | IRectangle]>();

  const $defs: Record<string, IChatGptSchema> = {};
  const schema: IChatGptSchema | null = ChatGptConverter.schema({
    $defs,
    components: collection.components,
    schema: collection.schemas[0],
    options: {
      constraint: false,
      reference: false,
    },
  });
  TestValidator.equals("anyOf")(["point", "line", "triangle", "rectangle"])(
    (schema as any)?.anyOf?.map((e: any) => e.properties?.type?.enum?.[0]),
  );
};

interface IPoint {
  type: "point";
  x: number;
  y: number;
}
interface ILine {
  type: "line";
  p1: IPoint;
  p2: IPoint;
}
interface ITriangle {
  type: "triangle";
  p1: IPoint;
  p2: IPoint;
  p3: IPoint;
}
interface IRectangle {
  type: "rectangle";
  p1: IPoint;
  p2: IPoint;
  p3: IPoint;
  p4: IPoint;
}
