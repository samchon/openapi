import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_llm_schema_reference_escaped_description_of_property =
  (): void => {
    const collection: IJsonSchemaCollection = typia.json.schemas<[IMember]>();
    const result = LlmSchemaComposer.parameters({
      components: collection.components,
      schema: collection.schemas[0]! as OpenApi.IJsonSchema.IReference,
    });
    TestValidator.predicate("description")(() => {
      if (result.success === false) return false;
      const description: string | undefined = (
        result.value.properties.hobby as OpenApi.IJsonSchema.IObject
      ).description;
      return (
        !!description?.includes("A hobby") &&
        !!description?.includes("The main hobby") &&
        !!description?.includes("The hobby type")
      );
    });
  };

interface IMember {
  id: string & tags.Format<"uuid">;
  name: string;
  age: number &
    tags.Type<"uint32"> &
    tags.Minimum<20> &
    tags.ExclusiveMaximum<100>;
  /**
   * A hobby.
   *
   * The main hobby.
   */
  hobby: IHobby;
}

/** The hobby type. */
interface IHobby {
  name: string;
}
