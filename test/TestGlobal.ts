import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { Singleton } from "tstl";
import typia from "typia";

export class TestGlobal {
  public static readonly ROOT: string =
    __filename.substring(__filename.length - 2) === "js"
      ? `${__dirname}/../..`
      : `${__dirname}/..`;

  public static get env(): IEnvironments {
    return environments.get();
  }
}

interface IEnvironments {
  CHATGPT_API_KEY?: string;
  GEMINI_API_KEY?: string;
}

const environments = new Singleton(() => {
  const env = dotenv.config();
  dotenvExpand.expand(env);
  return typia.assert<IEnvironments>(process.env);
});
