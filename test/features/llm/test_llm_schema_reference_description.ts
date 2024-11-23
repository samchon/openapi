import { TestValidator } from "@nestia/e2e";
import { ILlmSchemaV3 } from "@samchon/openapi";
import { LlmConverterV3 } from "@samchon/openapi/lib/converters/LlmConverterV3";
import typia, { IJsonSchemaCollection } from "typia";

export const test_llm_schema_reference_description = (): void => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<
      [Something.INested.IDeep, Something.INested, Something]
    >();
  const schema: ILlmSchemaV3 | null = LlmConverterV3.schema({
    components: collection.components,
    schema: collection.schemas[0],
    config: {
      recursive: false,
      constraint: true,
    },
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
