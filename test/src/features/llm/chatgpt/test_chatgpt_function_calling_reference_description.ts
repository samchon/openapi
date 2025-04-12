import { TestValidator } from "@nestia/e2e";
import { OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection, tags } from "typia";

export const test_chatgpt_function_calling_reference_description = () => {
  const collection: IJsonSchemaCollection = typia.json.schemas<[IMember]>();
  const result = LlmSchemaComposer.parameters("chatgpt")({
    config: {
      reference: true,
    },
    components: collection.components,
    schema: collection.schemas[0]! as OpenApi.IJsonSchema.IReference,
  });
  TestValidator.predicate("description")(
    result.success === true &&
      !!result.value.description?.includes("@link hobby") &&
      !!result.value.description?.includes("> A hobby") &&
      !!result.value.description?.includes("> The main hobby") &&
      !result.value.description?.includes("The hobby type"),
  );
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

/**
 * The hobby type.
 */
interface IHobby {
  name: string;
}
