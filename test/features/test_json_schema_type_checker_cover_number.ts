import { TestValidator } from "@nestia/e2e";
import { OpenApiTypeChecker } from "@samchon/openapi";

export const test_json_schema_type_checker_cover_number = (): void => {
  //----
  // SUCCESS SCENARIOS
  //----
  // COMMON
  TestValidator.equals("number covers integer")(true)(
    OpenApiTypeChecker.covers({})({ type: "number" }, { type: "integer" }),
  );
  TestValidator.equals("multipleOf covers multiplied")(true)(
    OpenApiTypeChecker.covers({})(
      { type: "number", multipleOf: 3 },
      { type: "number", multipleOf: 9 },
    ),
  );
  TestValidator.equals("enum cover relationship")(true)(
    OpenApiTypeChecker.covers({})(
      {
        oneOf: [{ const: 1 }, { const: 2 }, { const: 3 }],
      },
      {
        oneOf: [{ const: 1 }, { const: 2 }],
      },
    ),
  );

  // MINIMUM
  TestValidator.equals("minimum covers when equal")(true)(
    OpenApiTypeChecker.covers({})(
      { type: "number", minimum: 1 },
      { type: "number", minimum: 1 },
    ),
  );
  TestValidator.equals("minimum covers when less")(true)(
    OpenApiTypeChecker.covers({})(
      { type: "number", minimum: 1 },
      { type: "number", minimum: 2 },
    ),
  );
  TestValidator.equals("exclusiveMinimum covers minimum only when less")(true)(
    OpenApiTypeChecker.covers({})(
      { type: "number", minimum: 1, exclusiveMinimum: true },
      { type: "number", minimum: 2 },
    ),
  );

  // MAXIMUM
  TestValidator.equals("maximum covers when equal")(true)(
    OpenApiTypeChecker.covers({})(
      { type: "number", maximum: 2 },
      { type: "number", maximum: 2 },
    ),
  );
  TestValidator.equals("maximum covers when greater")(true)(
    OpenApiTypeChecker.covers({})(
      { type: "number", maximum: 2 },
      { type: "number", maximum: 1 },
    ),
  );
  TestValidator.equals("exclusiveMaximum covers minimum only when greater")(
    true,
  )(
    OpenApiTypeChecker.covers({})(
      { type: "number", maximum: 2, exclusiveMaximum: true },
      { type: "number", maximum: 1 },
    ),
  );

  //----
  // FAILURE SCENARIOS
  //----
  // COMMON
  TestValidator.equals("integer can't cover number")(false)(
    OpenApiTypeChecker.covers({})({ type: "integer" }, { type: "number" }),
  );
  TestValidator.equals("multipleOf can't cover none multiplied")(false)(
    OpenApiTypeChecker.covers({})(
      { type: "number", multipleOf: 3 },
      { type: "number", multipleOf: 4 },
    ),
  );
  TestValidator.equals("enum non cover (but covered) relationship")(false)(
    OpenApiTypeChecker.covers({})(
      {
        oneOf: [{ const: 1 }, { const: 2 }],
      },
      {
        oneOf: [{ const: 1 }, { const: 2 }, { const: 3 }],
      },
    ),
  );

  // MINIMUM
  TestValidator.equals("minimum can't cover when greater")(false)(
    OpenApiTypeChecker.covers({})(
      { type: "number", minimum: 2 },
      { type: "number", minimum: 1 },
    ),
  );
  TestValidator.equals("exclusiveMinimum can't cover equal")(false)(
    OpenApiTypeChecker.covers({})(
      { type: "number", minimum: 1, exclusiveMinimum: true },
      { type: "number", minimum: 1 },
    ),
  );

  // MAXIMUM
  TestValidator.equals("maximum can't cover when less")(false)(
    OpenApiTypeChecker.covers({})(
      { type: "number", maximum: 1 },
      { type: "number", maximum: 2 },
    ),
  );
  TestValidator.equals("exclusiveMaximum can't cover equal")(false)(
    OpenApiTypeChecker.covers({})(
      { type: "number", maximum: 2, exclusiveMaximum: true },
      { type: "number", maximum: 2 },
    ),
  );
};
