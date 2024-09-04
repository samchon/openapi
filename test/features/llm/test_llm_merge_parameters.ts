import { TestValidator } from "@nestia/e2e";
import { HttpLlm } from "@samchon/openapi";

export const test_llm_merge_parameters = (): void => {
  TestValidator.equals("atomics")(
    HttpLlm.mergeParameters({
      function: {
        name: "test",
        parameters: [
          { type: "boolean" },
          { type: "number" },
          { type: "string" },
          { type: "string" },
        ],
        separated: {
          human: [
            {
              schema: { type: "boolean" },
              index: 0,
            },
            {
              schema: { type: "number" },
              index: 1,
            },
          ],
          llm: [
            {
              schema: { type: "string" },
              index: 2,
            },
            {
              schema: { type: "string" },
              index: 3,
            },
          ],
        },
      },
      human: [false, 1],
      llm: ["two", "three"],
    }),
  )([false, 1, "two", "three"]);
};
