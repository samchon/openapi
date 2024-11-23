import { OpenApi } from "../../OpenApi";

export namespace JsonDescriptionUtil {
  export const cascade = (props: {
    prefix: string;
    components: OpenApi.IComponents;
    $ref: string;
    description: string | undefined;
    escape: boolean;
  }): string | undefined => {
    const index: number = props.$ref.lastIndexOf(".");
    if (index === -1) return props.description;

    const accessors: string[] = props.$ref.split(props.prefix)[1].split(".");
    const pReferences: IParentReference[] = accessors
      .slice(0, props.escape ? accessors.length : accessors.length - 1)
      .map((_, i, array) => array.slice(0, i + 1).join("."))
      .map((key) => ({
        key,
        description: props.components.schemas?.[key]?.description,
      }))
      .filter((schema): schema is IParentReference => !!schema?.description)
      .reverse();
    if (pReferences.length === 0) return props.description;
    return [
      ...(props.description?.length ? [props.description] : []),
      ...pReferences.map(
        (pRef, i) =>
          `Description of the ${i === 0 && props.escape ? "current" : "parent"} {@link ${pRef.key}} type:\n\n` +
          pRef.description
            .split("\n")
            .map((str) => `> ${str}`)
            .join("\n"),
      ),
    ].join("\n\n------------------------------\n\n");
  };
}

interface IParentReference {
  key: string;
  description: string;
}
