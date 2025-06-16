declare namespace API {
  type Response<T> = {
    code: number
    message: string
    data: T
  }
}
