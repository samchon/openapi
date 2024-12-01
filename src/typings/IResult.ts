export type IResult<T, E> = IResult.ISuccess<T> | IResult.IFailure<E>;
export namespace IResult {
  export interface ISuccess<T> {
    success: true;
    data: T;
  }
  export interface IFailure<E> {
    success: false;
    error: E;
  }
}
