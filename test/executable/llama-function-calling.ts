import { ILlmApplication, ILlmSchema, OpenApi } from "@samchon/openapi";
import { LlmSchemaComposer } from "@samchon/openapi/lib/composers/LlmSchemaComposer";
import fs from "fs";
import typia, { IJsonSchemaCollection, tags } from "typia";

import { TestGlobal } from "../TestGlobal";
import { ILlmTextPrompt } from "../structures/ILlmTextPrompt";
import { ShoppingSalePrompt } from "../utils/ShoppingSalePrompt";

interface IDefaultPerson {
  name: string & tags.Default<"John Doe">;
  age: number & tags.Default<42>;
}
interface IExamplePerson {
  name: string & tags.Example<"John Doe">;
  age: number & tags.Example<42>;
}
interface IShoppingCategory {
  /**
   * Identifier code of the category.
   */
  code: string & tags.Pattern<"^[a-z0-9_]+$">;

  /**
   * Name of the category.
   */
  name: string;

  /**
   * Children categories belong to this category.
   */
  children: IShoppingCategory[];
}

const SYSTEM_MESSAGE =
  "You are a helpful customer support assistant. Use the supplied tools to assist the user.";

const archive = async (props: {
  models: ILlmSchema.Model[];
  file: string;
  collection: IJsonSchemaCollection;
  name: string;
  description: string;
  texts: ILlmTextPrompt[];
}): Promise<void> => {
  for (const model of props.models) {
    const parameters: ILlmApplication<ILlmSchema.Model> | null =
      LlmSchemaComposer.parameters(model)({
        config: LlmSchemaComposer.defaultConfig(model) as any,
        components: props.collection.components,
        schema: typia.assert<OpenApi.IJsonSchema.IObject>(
          props.collection.schemas[0],
        ),
      }) as ILlmApplication<ILlmSchema.Model> | null;
    if (parameters === null) continue;
    await fs.promises.writeFile(
      `${TestGlobal.ROOT}/test-web-llm/assets/schemas/${props.file}.${model}.schema.json`,
      JSON.stringify(
        {
          model,
          name: props.name,
          description: props.description,
          parameters,
          texts: props.texts,
        },
        null,
        2,
      ),
      "utf8",
    );
  }
};

const main = async (): Promise<void> => {
  const models: ILlmSchema.Model[] = [
    "chatgpt",
    "claude",
    "gemini",
    "3.0",
    "3.1",
  ];
  await archive({
    models,
    file: "default",
    name: "enrollPerson",
    description: "Enroll a person to the restaurant reservation list.",
    collection: typia.json.schemas<[{ input: IDefaultPerson }]>(),
    texts: [
      {
        role: "assistant",
        content: SYSTEM_MESSAGE,
      },
      {
        role: "user",
        content:
          "Just enroll a person whose name and age values exactly same with the default values.",
      },
    ],
  });
  await archive({
    models,
    file: "example",
    name: "enrollPerson",
    description: "Enroll a person to the restaurant reservation list.",
    collection: typia.json.schemas<[{ input: IExamplePerson }]>(),
    texts: [
      {
        role: "assistant",
        content: SYSTEM_MESSAGE,
      },
      {
        role: "user",
        content:
          "Just enroll a person whose name and age values exactly same with the example values.",
      },
    ],
  });
  await archive({
    models,
    file: "recursive",
    name: "composeCategories",
    description: "Compose categories from the input.",
    collection: typia.json.schemas<[{ input: IShoppingCategory[] }]>(),
    texts: [
      {
        role: "assistant",
        content: SYSTEM_MESSAGE,
      },
      {
        role: "user",
        content: `I'll insert a shopping category tree here.
  
  - electronics
    - desktops
    - laptops
      - ultrabooks
      - macbooks
      - desknotes
      - 2 in 1 laptops
    - tablets
      - ipads
      - android tablets
      - windows tablets
    - smart phones
      - mini smartphones
      - phablets
      - gaming smartphones
      - rugged smartphones
      - foldable smartphones
    - smart watches
    - smart glasses
    - cameras
    - televisions
  - furnitures
  - accessories
    - jewelry
    - clothing
    - shoes
  - clothes
  - others`,
      },
    ],
  });
  await archive({
    models,
    file: "sale",
    ...ShoppingSalePrompt.schema(),
    texts: await ShoppingSalePrompt.texts(),
  });
};
main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
