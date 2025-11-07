import {
  HttpLlm,
  IHttpLlmApplication,
  ILlmApplication,
  ILlmSchema,
  OpenApi,
} from "@samchon/openapi";
import fs from "fs";
import { Singleton } from "tstl";
import typia from "typia";

import { TestGlobal } from "../../../TestGlobal";

export const test_chatgpt_application_type = (): void => {
  const http: IHttpLlmApplication<"chatgpt"> = application("chatgpt");
  const classic: ILlmApplication<"chatgpt"> = http;
  typia.assert(classic);
};

export const test_claude_application_type = (): void => {
  const http: IHttpLlmApplication<"claude"> = application("claude");
  const classic: ILlmApplication<"claude"> = http;
  typia.assert(classic);
};

export const test_llm_v30_application_type = (): void => {
  const http: IHttpLlmApplication<"3.0"> = application("3.0");
  const classic: ILlmApplication<"3.0"> = http;
  typia.assert(classic);
};

export const test_llm_v31_application_type = (): void => {
  const http: IHttpLlmApplication<"3.1"> = application("3.1");
  const classic: ILlmApplication<"3.1"> = http;
  typia.assert(classic);
};

const application = <Model extends ILlmSchema.Model>(model: Model) =>
  HttpLlm.application({
    model,
    document: document.get(),
  });

const document = new Singleton(() =>
  OpenApi.convert(
    JSON.parse(
      fs.readFileSync(`${TestGlobal.ROOT}/examples/v3.1/shopping.json`, "utf8"),
    ),
  ),
);
