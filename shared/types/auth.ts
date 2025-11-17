export interface ILoginBody {
  identifier: string;
  password: string;
  remember?: boolean;
}

export interface IRegisterBody {
  name: string;
  email: string;
  password: string;
  consent?: boolean;
}

export interface IVerifyEmailBody {
  email: string;
  code: string;
}

export interface IResendVerificationEmailBody {
  email: string;
}

export interface IRefreshBody {
  refresh_token: string;
}

export interface IForgotPasswordBody {
  email: string;
}

export interface ICreateNewPasswordBody {
  password: string;
  password_confirmation: string;
  code: string;
}

export interface ITokenResponse {
  access_token: string;
  refresh_token: string;
}
