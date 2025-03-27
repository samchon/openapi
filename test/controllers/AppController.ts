import {
  TypedBody,
  TypedFormData,
  TypedParam,
  TypedQuery,
  TypedRoute,
} from "@nestia/core";
import { Controller, Query } from "@nestjs/common";
import Multer from "multer";
import { tags } from "typia";

@Controller()
export class AppController {
  @TypedRoute.Get(":index/:level/:optimal/parameters")
  public parameters(
    @TypedParam("index")
    index: string & tags.Format<"uri"> & tags.ContentMediaType<"text/html">,
    @TypedParam("level") level: number,
    @TypedParam("optimal") optimal: boolean,
  ) {
    return { index, level, optimal };
  }

  @TypedRoute.Get(":index/:level/:optimal/query")
  public query(
    @TypedParam("index")
    index: string & tags.Format<"uri"> & tags.ContentMediaType<"text/html">,
    @TypedParam("level") level: number,
    @TypedParam("optimal") optimal: boolean,
    @TypedQuery() query: IQuery,
  ) {
    return { index, level, optimal, query };
  }

  /**
   * @tag body
   * @tag post
   */
  @TypedRoute.Post(":index/:level/:optimal/body")
  public body(
    @TypedParam("index")
    index: string & tags.Format<"uri"> & tags.ContentMediaType<"text/html">,
    @TypedParam("level") level: number,
    @TypedParam("optimal") optimal: boolean,
    @TypedBody() body: IBody,
  ) {
    return { index, level, optimal, body };
  }

  @TypedRoute.Post(":index/:level/:optimal/query/body")
  public query_body(
    @TypedParam("index")
    index: string & tags.Format<"uri"> & tags.ContentMediaType<"text/html">,
    @TypedParam("level") level: number,
    @TypedParam("optimal") optimal: boolean,
    @Query("thumbnail")
    thumbnail: string & tags.Format<"uri"> & tags.ContentMediaType<"image/*">,
    @TypedQuery() query: { summary: string },
    @TypedBody() body: IBody,
  ) {
    return {
      index,
      level,
      optimal,
      query: {
        ...query,
        thumbnail,
      },
      body,
    };
  }

  @TypedRoute.Post(":index/:level/:optimal/multipart")
  public query_multipart(
    @TypedParam("index")
    index: string & tags.Format<"uri"> & tags.ContentMediaType<"text/html">,
    @TypedParam("level") level: number,
    @TypedParam("optimal") optimal: boolean,
    @TypedQuery() query: IQuery,
    @TypedFormData.Body(() => Multer())
    body: IMultipart,
  ) {
    return {
      index,
      level,
      optimal,
      query,
      body: {
        ...body,
        file: `http://localhost:4000/files/${Date.now()}.raw`,
      },
    };
  }

  /**
   * @deprecated
   */
  @TypedRoute.Get("nothing")
  public nothing(): void {}
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
