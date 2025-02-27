import { OpenApi } from "../../OpenApi";
import { _isFormatByte } from "../../functional/_isFormatByte";
import { _isFormatDate } from "../../functional/_isFormatDate";
import { _isFormatDateTime } from "../../functional/_isFormatDateTime";
import { _isFormatDuration } from "../../functional/_isFormatDuration";
import { _isFormatEmail } from "../../functional/_isFormatEmail";
import { _isFormatHostname } from "../../functional/_isFormatHostname";
import { _isFormatIdnEmail } from "../../functional/_isFormatIdnEmail";
import { _isFormatIdnHostname } from "../../functional/_isFormatIdnHostname";
import { _isFormatIpv4 } from "../../functional/_isFormatIpv4";
import { _isFormatIpv6 } from "../../functional/_isFormatIpv6";
import { _isFormatIri } from "../../functional/_isFormatIri";
import { _isFormatIriReference } from "../../functional/_isFormatIriReference";
import { _isFormatJsonPointer } from "../../functional/_isFormatJsonPointer";
import { _isFormatRegex } from "../../functional/_isFormatRegex";
import { _isFormatRelativeJsonPointer } from "../../functional/_isFormatRelativeJsonPointer";
import { _isFormatTime } from "../../functional/_isFormatTime";
import { _isFormatUri } from "../../functional/_isFormatUri";
import { _isFormatUriReference } from "../../functional/_isFormatUriReference";
import { _isFormatUriTemplate } from "../../functional/_isFormatUriTemplate";
import { _isFormatUrl } from "../../functional/_isFormatUrl";
import { _isFormatUuid } from "../../functional/_isFormatUuid";
import { IOpenApiValidatorContext } from "./IOpenApiValidatorContext";

export namespace OpenApiStringValidator {
  export const validate = (
    ctx: IOpenApiValidatorContext<OpenApi.IJsonSchema.IString>,
  ): boolean => {
    if (typeof ctx.value !== "string") return false;
    return [
      ctx.schema.minLength !== undefined
        ? ctx.value.length >= ctx.schema.minLength
        : true,
      ctx.schema.maxLength !== undefined
        ? ctx.value.length <= ctx.schema.maxLength
        : true,
      ctx.schema.pattern !== undefined
        ? new RegExp(ctx.schema.pattern).test(ctx.value)
        : true,
      ctx.schema.format && FORMAT[ctx.schema.format as "uuid"]
        ? FORMAT[ctx.schema.format as "uuid"](ctx.value)
        : true,
    ].every((v) => v);
  };
}

const FORMAT = {
  byte: _isFormatByte,
  regex: _isFormatRegex,
  uuid: _isFormatUuid,
  email: _isFormatEmail,
  hostname: _isFormatHostname,
  "idn-email": _isFormatIdnEmail,
  "idn-hostname": _isFormatIdnHostname,
  iri: _isFormatIri,
  "iri-reference": _isFormatIriReference,
  ipv4: _isFormatIpv4,
  ipv6: _isFormatIpv6,
  uri: _isFormatUri,
  "uri-reference": _isFormatUriReference,
  "uri-template": _isFormatUriTemplate,
  url: _isFormatUrl,
  "date-time": _isFormatDateTime,
  date: _isFormatDate,
  time: _isFormatTime,
  duration: _isFormatDuration,
  "json-pointer": _isFormatJsonPointer,
  "relative-json-pointer": _isFormatRelativeJsonPointer,
};
