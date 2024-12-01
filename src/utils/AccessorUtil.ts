export namespace AccessorUtil {
  export const reference = (prefix: string): string =>
    prefix
      .split("/")
      .filter((str) => !!str.length)
      .join(".");
}
