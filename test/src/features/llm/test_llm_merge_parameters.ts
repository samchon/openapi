import { TestValidator } from "@nestia/e2e";
import { HttpLlm } from "@samchon/openapi";

export const test_llm_merge_parameters = (): void => {
  TestValidator.equals("atomics")(
    HttpLlm.mergeParameters({
      function: {
        name: "test",
        parameters: {
          type: "object",
          properties: {
            a: { type: "boolean" },
            b: { type: "number" },
            c: { type: "string" },
            d: { type: "string" },
          },
          additionalProperties: false,
          required: ["a", "b", "c", "d"],
        },
        separated: {
          human: {
            type: "object",
            properties: {
              a: { type: "boolean" },
              b: { type: "number" },
            },
            additionalProperties: false,
            required: ["a", "b"],
          },
          llm: {
            type: "object",
            properties: {
              c: { type: "string" },
              d: { type: "string" },
            },
            additionalProperties: false,
            required: ["c", "d"],
          },
        },
        validate: null!,
      },
      human: {
        a: false,
        b: 1,
      },
      llm: {
        c: "two",
        d: "three",
      },
    }),
  )({
    a: false,
    b: 1,
    c: "two",
    d: "three",
  });
};
