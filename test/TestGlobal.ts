export namespace TestGlobal {
  export const ROOT: string =
    __filename.substring(__filename.length - 2) === "js"
      ? `${__dirname}/../..`
      : `${__dirname}/..`;
}
