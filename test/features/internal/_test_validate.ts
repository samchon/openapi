import { IValidation } from "@samchon/openapi";
import { OpenApiValidator } from "@samchon/openapi/lib/utils/OpenApiValidator";
import typia, { IJsonSchemaCollection } from "typia";

import { Spoiler } from "../../helpers/Spoiler";

export const _test_validate = <T>(props: {
  collection: IJsonSchemaCollection;
  factory: {
    generate: () => T;
    SPOILERS?: Spoiler<T>[];
  };
  name: string;
}): void => {
  const input: T = props.factory.generate();
  const validate = OpenApiValidator.create({
    components: props.collection.components,
    schema: props.collection.schemas[0],
    required: true,
  });
  const result: IValidation<unknown> = validate(input);
  if (result.success === false)
    throw new Error(
      `Bug on OpenApiValidator.validate(): failed to understand the ${props.name} type.`,
    );
  else if (result.data !== input)
    throw new Error(
      "Bug on OpenApiValidator.validate(): failed to archive the input value.",
    );
  typia.assert(result);
};
