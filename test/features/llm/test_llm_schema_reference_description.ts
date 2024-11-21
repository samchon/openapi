import { TestValidator } from "@nestia/e2e";
import { ILlmSchema } from "@samchon/openapi";
import { HttpLlmConverter } from "@samchon/openapi/lib/converters/HttpLlmConverter";
import typia, { IJsonApplication } from "typia";

export const test_llm_schema_reference_description = (): void => {
  const collection: IJsonApplication =
    typia.json.application<
      [Something.INested.IDeep, Something.INested, Something]
    >();
  const schema: ILlmSchema | null = HttpLlmConverter.schema({
    components: collection.components,
    schema: collection.schemas[0],
    recursive: false,
  });
  TestValidator.predicate("description")(
    () =>
      !!schema?.description &&
      schema.description.includes("Something interface") &&
      schema.description.includes("Something nested interface") &&
      schema.description.includes("Something nested and deep interface"),
  );
};

/**
 * Something interface.
 */
interface Something {
  x: number;
}
namespace Something {
  /**
   * Something nested interface.
   */
  export interface INested {
    y: number;
  }
  export namespace INested {
    /**
     * Something nested and deep interface.
     */
    export interface IDeep {
      z: number;
    }
  }
}
