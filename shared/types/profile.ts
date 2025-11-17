export interface IProfile {
  id: number;
  name: string;
  email: string;
  email_being_changed?: string;
  email_verified: boolean;
  roles: Role[];
}

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export interface IUpdateNameBody {
  name: string;
}

export interface IRequestEmailChangeBody {
  new_email: string;
}

export interface IConfirmEmailChangeBody {
  email: string;
  code: string;
}

export interface IUpdatePasswordBody {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface IDeleteAccountBody {
  password: string;
}
