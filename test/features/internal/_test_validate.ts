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
  typia.assert(result);

  if (result.success === false) {
    console.log(result.errors);
    throw new Error(
      `Bug on OpenApiValidator.validate(): failed to understand the ${props.name} type.`,
    );
  } else if (result.data !== input)
    throw new Error(
      "Bug on OpenApiValidator.validate(): failed to archive the input value.",
    );

  const wrong: ISpoiled[] = [];
  for (const spoil of props.factory.SPOILERS ?? []) {
    const elem: T = props.factory.generate();
    const expected: string[] = spoil(elem);
    const valid: typia.IValidation<unknown> = validate(elem);

    if (valid.success === true) {
      console.log(expected);
      throw new Error(
        `Bug on typia.validate(): failed to detect error on the ${props.name} type.`,
      );
    }

    typia.assertEquals(valid);
    expected.sort();
    valid.errors.sort((x, y) => (x.path < y.path ? -1 : 1));

    if (
      valid.errors.length !== expected.length ||
      valid.errors.every((e, i) => e.path === expected[i]) === false
    )
      wrong.push({
        expected,
        actual: valid.errors.map((e) => e.path),
      });
  }
  if (wrong.length !== 0) {
    console.log(wrong);
    throw new Error(
      `Bug on typia.validate(): failed to detect error on the ${props.name} type.`,
    );
  }
};

interface ISpoiled {
  expected: string[];
  actual: string[];
}
