import { NamingConvention } from "typia/lib/utils/NamingConvention";

export namespace StringUtil {
  export const capitalize = (str: string) =>
    str[0].toUpperCase() + str.slice(1).toLowerCase();

  export const pascal = (path: string) =>
    splitWithNormalization(path)
      .filter((str) => str[0] !== "{")
      .map(NamingConvention.pascal)
      .join("");

  export const splitWithNormalization = (path: string) =>
    path
      .split("/")
      .map((str) => normalize(str.trim()))
      .filter((str) => !!str.length);

  export const reJoinWithDecimalParameters = (path: string) =>
    path
      .split("/")
      .filter((str) => !!str.length)
      .map((str) =>
        str[0] === "{" && str[str.length - 1] === "}"
          ? `:${str.substring(1, str.length - 1)}`
          : str,
      )
      .join("/");

  export const normalize = (str: string) =>
    str.split(".").join("_").split("-").join("_");

  export const escapeDuplicate =
    (keep: string[]) =>
    (change: string): string =>
      keep.includes(change) ? escapeDuplicate(keep)(`_${change}`) : change;
}
