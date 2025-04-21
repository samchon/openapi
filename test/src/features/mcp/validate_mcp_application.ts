import { TestValidator } from "@nestia/e2e";
import { HttpLlm, ILlmSchema, McpLlm, OpenApi } from "@samchon/openapi";
import fs from "fs";
import { Singleton, VariadicSingleton } from "tstl";

import { LlmSchemaComposer } from "../../../../lib/composers/LlmSchemaComposer";
import { TestGlobal } from "../../TestGlobal";

export const test_mcp_application_of_chatgpt = () =>
  validate_mcp_application("chatgpt");

export const test_mcp_application_of_claude = () =>
  validate_mcp_application("claude");

export const test_mcp_application_of_deepseek = () =>
  validate_mcp_application("deepseek");

export const test_mcp_application_of_gemini = () =>
  validate_mcp_application("gemini");

export const test_mcp_application_of_llama = () =>
  validate_mcp_application("llama");

export const test_mcp_application_of_v30 = () =>
  validate_mcp_application("3.0");

export const test_mcp_application_of_v31 = () =>
  validate_mcp_application("3.1");

const validate_mcp_application = async <Model extends ILlmSchema.Model>(
  model: Model,
): Promise<void> => {
  const llm = await getApplication.get(model);
  const mcp = McpLlm.application({
    model,
    tools: llm.functions.map((f) => ({
      name: f.name,
      description: f.description,
      inputSchema: f.parameters,
    })),
    options: {
      reference: true,
    } as any,
  });
  TestValidator.equals("functions")(llm.functions.length)(mcp.functions.length);
  TestValidator.equals("errors")(0)(mcp.errors.length);

  llm.functions.forEach((x) => {
    const parameters = { ...x.parameters };
    if (model !== "3.0" && model !== "gemini") {
      const visited: Set<string> = new Set<string>();
      LlmSchemaComposer.typeChecker(model).visit({
        closure: (schema: any) => {
          if (typeof schema.$ref === "string")
            visited.add(schema.$ref.split("/").pop()!);
        },
        schema: parameters,
        $defs: (parameters as any).$defs,
      } as any);
      (parameters as any).$defs = Object.fromEntries(
        Object.entries((parameters as any).$defs).filter(([key]) =>
          visited.has(key),
        ),
      );
    }
    const y = mcp.functions.find((y) => y.name === x.name);
    TestValidator.equals(
      `parameters: ${x.name}`,
      (key) => key === "description",
    )(parameters)((y?.parameters as any) ?? {});
  });

  if (process.argv.includes("--file"))
    await fs.promises.writeFile(
      `${TestGlobal.ROOT}/examples/mcp/${model}.application.json`,
      JSON.stringify(mcp, null, 2),
      "utf8",
    );
};

const getApplication = new VariadicSingleton(async (model: ILlmSchema.Model) =>
  HttpLlm.application({
    model,
    document: await getDocument.get(),
    options: {
      reference: true,
    } as any,
  }),
);

const getDocument = new Singleton(async () =>
  OpenApi.convert(
    await fetch(
      "https://raw.githubusercontent.com/samchon/shopping-backend/refs/heads/master/packages/api/swagger.json",
    ).then((r) => r.json()),
  ),
);
