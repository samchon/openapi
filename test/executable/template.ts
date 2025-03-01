import fs from "fs";

const STRUCTURES: string = `${__dirname}/../structures`;
const FEATURES: string = `${__dirname}/../features/validate`;

const main = async (): Promise<void> => {
  if (fs.existsSync(FEATURES))
    await fs.promises.rm(FEATURES, {
      recursive: true,
    });
  await fs.promises.mkdir(FEATURES);

  const structures: string[] = (await fs.promises.readdir(STRUCTURES))
    .filter((file) => file.endsWith(".ts"))
    .map((file) => file.substring(0, file.length - 3));
  for (const s of structures) {
    await fs.promises.writeFile(
      `${FEATURES}/test_validate_${s}.ts`,
      [
        `import typia from "typia";`,
        "",
        `import { _test_validate } from "../internal/_test_validate";`,
        `import { ${s} } from "../../structures/${s}";`,
        "",
        `export const test_validate_${s} = (): void =>`,
        `  _test_validate<${s}>({`,
        `    collection: typia.json.schemas<[${s}]>(),`,
        `    factory: ${s},`,
        `    name: ${JSON.stringify(s)},`,
        `  });`,
        "",
      ].join("\n"),
      "utf8",
    );
  }
};
main().catch((error) => {
  console.log(error);
  process.exit(-1);
});
