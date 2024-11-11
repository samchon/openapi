import { TestValidator } from "@nestia/e2e";
import { IChatGptSchema } from "@samchon/openapi";
import { ChatGptConverter } from "@samchon/openapi/lib/converters/ChatGptConverter";
import typia, { IJsonApplication } from "typia";

export const test_chatgpt_schema_oneof_discriminator = (): void => {
  const collection: IJsonApplication =
    typia.json.application<[IPoint | ILine | ITriangle | IRectangle]>();
  const schema = ChatGptConverter.schema({
    components: collection.components,
    schema: collection.schemas[0],
  });
  TestValidator.equals("discriminator")({
    oneOf: [
      {
        $ref: "#/$defs/IPoint",
      },
      {
        $ref: "#/$defs/ILine",
      },
      {
        $ref: "#/$defs/ITriangle",
      },
      {
        $ref: "#/$defs/IRectangle",
      },
    ],
    discriminator: {
      propertyName: "type",
      mapping: {
        point: "#/$defs/IPoint",
        line: "#/$defs/ILine",
        triangle: "#/$defs/ITriangle",
        rectangle: "#/$defs/IRectangle",
      },
    },
  } satisfies IChatGptSchema as IChatGptSchema)(schema as IChatGptSchema);
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
