import fs from "fs";

const STRUCTURES: string = `${__dirname}/../structures`;
const FEATURES: string = `${__dirname}/../features/validateEquals`;

const main = async (): Promise<void> => {
  if (fs.existsSync(FEATURES))
    await fs.promises.rm(FEATURES, {
      recursive: true,
    });
  await fs.promises.mkdir(FEATURES);

  const structures: string[] = (await fs.promises.readdir(STRUCTURES))
    .filter((file) => file.endsWith(".ts"))
    .filter(
      (file) =>
        fs
          .readFileSync(`${STRUCTURES}/${file}`, "utf8")
          .includes("export const ADDABLE = false") === false,
    )
    .map((file) => file.substring(0, file.length - 3));
  for (const s of structures) {
    await fs.promises.writeFile(
      `${FEATURES}/test_validateEquals_${s}.ts`,
      [
        `import typia from "typia";`,
        "",
        `import { ${s} } from "../../structures/${s}";`,
        `import { _test_validateEquals } from "../internal/_test_validateEquals";`,
        "",
        `export const test_validateEquals_${s} = (): void =>`,
        `  _test_validateEquals<${s}>({`,
        `    ...typia.json.schema<${s}>(),`,
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
