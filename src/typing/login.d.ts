declare namespace Login {
  type SendCodeParams = {
    mobile: string
  }
  type LoginWithCodeParams = {
    code: string
  } & SendCodeParams

  type SendCodeResponse = string

  type LoginWithCodeResponse = {
    token: string
    sale_name: string
    sale_id: string
  }
}
