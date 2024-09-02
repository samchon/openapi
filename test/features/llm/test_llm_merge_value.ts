import { TestValidator } from "@nestia/e2e";
import { LlmMerger } from "@samchon/openapi/lib/converters/LlmMerger";

export const test_llm_merge_parameters = (): void => {
  TestValidator.equals("number")(LlmMerger.value(1, 2))(2);
  TestValidator.equals("nullable")(LlmMerger.value(0, null))(0);
  TestValidator.equals("optional")(LlmMerger.value(0, undefined))(0);
  TestValidator.equals("object")(
    LlmMerger.value(
      {
        a: "A",
        array: [1, 2, 3],
        nestedArray: [{ alpha: "alpha" }, { alpha: "alpha" }],
        object: { x: "X" },
      },
      {
        b: "B",
        array: [3, 4, 5],
        nestedArray: [{ beta: "beta" }, { beta: "beta" }],
        object: { y: "Y" },
      },
    ),
  )({
    a: "A",
    b: "B",
    array: [3, 4, 5],
    nestedArray: [
      {
        alpha: "alpha",
        beta: "beta",
      },
      {
        alpha: "alpha",
        beta: "beta",
      },
    ],
    object: { x: "X", y: "Y" },
  });
  TestValidator.equals("membership")(
    LlmMerger.value(
      {
        name: "Samchon",
        email: "samchon.github@gmail.com",
        password: "1234",
        age: 30,
        gender: 1,
      },
      {
        homepage: "https://github.com/samchon",
        secret: "something",
      },
    ),
  )({
    name: "Samchon",
    email: "samchon.github@gmail.com",
    password: "1234",
    age: 30,
    gender: 1,
    homepage: "https://github.com/samchon",
    secret: "something",
  });
};
