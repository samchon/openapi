import {
  TypedBody,
  TypedFormData,
  TypedParam,
  TypedQuery,
  TypedRoute,
} from "@nestia/core";
import { Controller, Query } from "@nestjs/common";
import { tags } from "typia";

@Controller()
export class AppController {
  @TypedRoute.Get(":a/:b/:c/parameters")
  public parameters(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
  ) {
    return { a, b, c };
  }

  @TypedRoute.Get(":a/:b/:c/query")
  public query(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
    @TypedQuery()
    query: IQuery,
  ) {
    return { a, b, c, query };
  }

  @TypedRoute.Post(":a/:b/:c/body")
  public body(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
    @TypedBody()
    body: IBody,
  ) {
    return { a, b, c, body };
  }

  @TypedRoute.Post(":a/:b/:c/query/body")
  public query_body(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
    @Query("thumbnail")
    thumbnail: string & tags.Format<"uri"> & tags.ContentMediaType<"image/*">,
    @TypedQuery()
    query: {
      summary: string;
    },
    @TypedBody()
    body: IBody,
  ) {
    return {
      a,
      b,
      c,
      query: {
        ...query,
        thumbnail,
      },
      body,
    };
  }

  @TypedRoute.Post(":a/:b/:c/multipart")
  public query_multipart(
    @TypedParam("a") a: string,
    @TypedParam("b") b: number,
    @TypedParam("c") c: boolean,
    @TypedQuery() query: IQuery,
    @TypedFormData.Body()
    body: IMultipart,
  ) {
    return {
      a,
      b,
      c,
      query,
      body: {
        ...body,
        file: `http://localhost:3000/files/${Date.now()}.raw`,
      },
    };
  }
}

interface IQuery {
  summary: string;
  thumbnail: string & tags.Format<"uri"> & tags.ContentMediaType<"image/*">;
}
interface IBody {
  title: string;
  body: string;
  draft: boolean;
}
interface IMultipart extends IBody {
  file: File;
}
