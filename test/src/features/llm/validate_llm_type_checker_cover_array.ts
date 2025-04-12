import { TestValidator } from "@nestia/e2e";
import { ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import typia, { IJsonSchemaCollection } from "typia";

export const test_chatgpt_type_checker_cover_array = (): void =>
  validate_llm_type_checker_cover_array("chatgpt");

export const test_claude_type_checker_cover_array = (): void =>
  validate_llm_type_checker_cover_array("claude");

export const test_deepseek_type_checker_cover_array = (): void =>
  validate_llm_type_checker_cover_array("deepseek");

export const test_gemini_type_checker_cover_array = (): void =>
  validate_llm_type_checker_cover_array("gemini");

export const test_llama_type_checker_cover_array = (): void =>
  validate_llm_type_checker_cover_array("llama");

export const test_llm_v30_type_checker_cover_array = (): void =>
  validate_llm_type_checker_cover_array("3.0");

export const test_llm_v31_type_checker_cover_array = (): void =>
  validate_llm_type_checker_cover_array("3.1");

const validate_llm_type_checker_cover_array = <Model extends ILlmSchema.Model>(
  model: Model,
) => {
  const collection: IJsonSchemaCollection =
    typia.json.schemas<[Plan2D, Plan3D, Box2D, Box3D]>();
  const components: OpenApi.IComponents = collection.components as any;
  const plan2D: OpenApi.IJsonSchema = components.schemas!.Plan2D;
  const plan3D: OpenApi.IJsonSchema = components.schemas!.Plan3D;
  const box2D: OpenApi.IJsonSchema = components.schemas!.Box2D;
  const box3D: OpenApi.IJsonSchema = components.schemas!.Box3D;

  const $defs = {};
  const check = (x: OpenApi.IJsonSchema, y: OpenApi.IJsonSchema): boolean => {
    const [a, b] = [x, y].map((schema) => {
      const result = LlmSchemaComposer.schema(model)({
        config: LlmSchemaComposer.defaultConfig(model) as any,
        components: collection.components,
        schema: schema,
        $defs,
      });
      if (result.success === false)
        throw new Error(`Failed to compose ${model} schema.`);
      return result.value;
    });
    return model === "3.0" || model === "gemini"
      ? (LlmSchemaComposer.typeChecker(model).covers as any)(a, b)
      : (LlmSchemaComposer.typeChecker(model).covers as any)({
          x: a,
          y: b,
          $defs,
        });
  };

  TestValidator.equals(model + " Plan3D[] covers Plan2D[]")(true)(
    check({ type: "array", items: plan3D }, { type: "array", items: plan2D }),
  );
  TestValidator.equals(model + " Box3D[] covers Box2D[]")(true)(
    check({ type: "array", items: box3D }, { type: "array", items: box2D }),
  );
  if (model !== "gemini")
    TestValidator.equals(
      model + " Array<Plan3D|Box3D> covers Array<Plan2D|Box2D>",
    )(true)(
      check(
        {
          type: "array",
          items: {
            oneOf: [plan3D, box3D],
          },
        },
        {
          type: "array",
          items: {
            oneOf: [plan2D, box2D],
          },
        },
      ),
    );
  if (model !== "gemini")
    TestValidator.equals(model + " (Plan3D|Box3D)[] covers (Plan2D|Box2D)[]")(
      true,
    )(
      check(
        {
          oneOf: [
            { type: "array", items: plan3D },
            { type: "array", items: box3D },
          ],
        },
        {
          oneOf: [
            { type: "array", items: plan2D },
            { type: "array", items: box2D },
          ],
        },
      ),
    );

  TestValidator.equals(model + " Plan2D[] can't cover Plan3D[]")(false)(
    check({ type: "array", items: plan2D }, { type: "array", items: plan3D }),
  );
  TestValidator.equals(model + " Box2D[] can't cover Box3D[]")(false)(
    check({ type: "array", items: box2D }, { type: "array", items: box3D }),
  );
  if (model !== "gemini")
    if (model !== "gemini")
      TestValidator.equals(
        "Array<Plan2D|Box2D> can't cover Array<Plan3D|Box3D>",
      )(false)(
        check(
          {
            type: "array",
            items: {
              oneOf: [plan2D, box2D],
            },
          },
          {
            type: "array",
            items: {
              oneOf: [plan3D, box3D],
            },
          },
        ),
      );
  if (model !== "gemini")
    TestValidator.equals(
      model + " (Plan2D[]|Box2D[]) can't cover (Plan3D[]|Box3D[])",
    )(false)(
      check(
        {
          oneOf: [
            { type: "array", items: plan2D },
            { type: "array", items: box2D },
          ],
        },
        {
          oneOf: [
            { type: "array", items: plan3D },
            { type: "array", items: box3D },
          ],
        },
      ),
    );
  if (model !== "gemini")
    TestValidator.equals(model + " Plan3D[] can't cover (Plan2D|Box2D)[]")(
      false,
    )(
      check(
        { type: "array", items: plan3D },
        {
          oneOf: [
            { type: "array", items: plan2D },
            { type: "array", items: box2D },
          ],
        },
      ),
    );
  if (model !== "gemini")
    TestValidator.equals(model + " Box3D[] can't cover Array<Plan2D|Box2D>")(
      false,
    )(
      check(
        { type: "array", items: box3D },
        {
          type: "array",
          items: {
            oneOf: [plan2D, box2D],
          },
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
  nested: Point2D[];
};
type Box3D = {
  size: Point3D;
  nested: Point3D[];
};
