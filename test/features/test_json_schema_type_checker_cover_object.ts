import { TestValidator } from "@nestia/e2e";
import { OpenApi, OpenApiTypeChecker } from "@samchon/openapi";
import typia, { IJsonApplication } from "typia";

export const test_json_schema_type_checker_cover_object = (): void => {
  const app: IJsonApplication =
    typia.json.application<[Plan2D, Plan3D, Box2D, Box3D]>();
  const components: OpenApi.IComponents = app.components as any;

  const plan2D: OpenApi.IJsonSchema = components.schemas!.Plan2D;
  const plan3D: OpenApi.IJsonSchema = components.schemas!.Plan3D;
  const box2D: OpenApi.IJsonSchema = components.schemas!.Box2D;
  const box3D: OpenApi.IJsonSchema = components.schemas!.Box3D;

  //----
  // SUCCESS SCENARIOS
  //----
  // SINGLE OBJECT TYPE
  TestValidator.equals("Plan3D covers Plan2D")(true)(
    OpenApiTypeChecker.covers(components)(plan3D, plan2D),
  );
  TestValidator.equals("Box3D covers Box2D")(true)(
    OpenApiTypeChecker.covers(components)(box3D, box2D),
  );

  // UNION TYPE
  TestValidator.equals("(Plan3D|Box3D) covers Plan2D")(true)(
    OpenApiTypeChecker.covers(components)({ oneOf: [plan3D, box3D] }, plan2D),
  );
  TestValidator.equals("(Plan3D|Box3D) covers Box2D")(true)(
    OpenApiTypeChecker.covers(components)({ oneOf: [plan3D, box3D] }, box2D),
  );
  TestValidator.equals("(Plan3D|Box3D) covers (Plan2D|Box2D)")(true)(
    OpenApiTypeChecker.covers(components)(
      { oneOf: [plan3D, box3D] },
      { oneOf: [box2D, box2D] },
    ),
  );

  // DYNAMIC FEATURES
  TestValidator.equals("optional covers required")(true)(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
      {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
    ),
  );
  TestValidator.equals("(additionalProperties := true) cover static")(true)(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
        additionalProperties: true,
      },
      {
        type: "object",
      },
    ),
  );
  TestValidator.equals("(addtionalProperties := object) covers static")(true)(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
        additionalProperties: {
          type: "object",
        },
      },
      {
        type: "object",
      },
    ),
  );
  TestValidator.equals("(addtionalProperties := true) covers everything")(true)(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
        additionalProperties: true,
      },
      {
        type: "object",
        additionalProperties: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    ),
  );
  TestValidator.equals("addtionalProperties covers relationship")(true)(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
        additionalProperties: box3D,
      },
      {
        type: "object",
        additionalProperties: box2D,
      },
    ),
  );

  //----
  // FAILURE SCENARIOS
  //----
  // SINGLE OBJECT TYPE
  TestValidator.equals("Plan2D can't cover Plan3D")(false)(
    OpenApiTypeChecker.covers(components)(plan2D, plan3D),
  );
  TestValidator.equals("Box2D can't cover Box3D")(false)(
    OpenApiTypeChecker.covers(components)(box2D, box3D),
  );

  // UNION TYPE
  TestValidator.equals("Plan3D can't cover (Plan2D|Box2D)")(false)(
    OpenApiTypeChecker.covers(components)(plan3D, { oneOf: [plan2D, box2D] }),
  );
  TestValidator.equals("Box3D can't cover (Plan2D|Box2D)")(false)(
    OpenApiTypeChecker.covers(components)(box3D, { oneOf: [plan2D, box2D] }),
  );

  // DYNAMIC FEATURES
  TestValidator.equals("required can't cover optional")(false)(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
      {
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
    ),
  );
  TestValidator.equals("static can't cover (additionalProperties := true)")(
    false,
  )(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
      },
      {
        type: "object",
        additionalProperties: true,
      },
    ),
  );
  TestValidator.equals("static can't cover (additionalProperties := object)")(
    false,
  )(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
      },
      {
        type: "object",
        additionalProperties: {
          type: "object",
        },
      },
    ),
  );
  TestValidator.equals("nothing can cover (addtionalProperties := true)")(
    false,
  )(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
        additionalProperties: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
      {
        type: "object",
        additionalProperties: true,
      },
    ),
  );
  TestValidator.equals("relationship can't cover addtionalProperties")(false)(
    OpenApiTypeChecker.covers(components)(
      {
        type: "object",
        additionalProperties: box2D,
      },
      {
        type: "object",
        additionalProperties: box3D,
      },
    ),
  );
};

type Plan2D = {
  center: Point2D;
  size: Point2D;
  geometries: Geometry2D[];
};
type Plan3D = {
  center: Point3D;
  size: Point3D;
  geometries: Geometry3D[];
};
type Geometry3D = {
  position: Point3D;
  scale: Point3D;
};
type Geometry2D = {
  position: Point2D;
  scale: Point2D;
};
type Point2D = {
  x: number;
  y: number;
};
type Point3D = {
  x: number;
  y: number;
  z: number;
};
type Box2D = {
  size: Point2D;
  nested: Box2D;
};
type Box3D = {
  size: Point3D;
  nested: Box3D;
};
