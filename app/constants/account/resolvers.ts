import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";

export const updateNameResolver = zodResolver(
  z.object({
    name: z
      .string()
      .nonempty({ message: "account.profile.updateName.errors.required" })
      .min(2, { message: "account.profile.updateName.errors.too_short" }),
  }),
);

export const updateEmailResolver = zodResolver(
  z.object({
    new_email: z
      .string()
      .nonempty({ message: "account.profile.updateEmail.errors.required" })
      .email({ message: "account.profile.updateEmail.errors.invalid" }),
  }),
);

export const deleteAccountResolver = zodResolver(
  z.object({
    password: z.string().nonempty({
      message: "account.security.deleteAccount.errors.required",
    }),
  }),
);

export const checkEmailCodeResolver = zodResolver(
  z.object({
    code: z
      .string()
      .length(6, {
        message: "account.profile.checkEmail.errors.invalid_length",
      })
      .regex(/^\d{6}$/, {
        message: "account.profile.checkEmail.errors.invalid_length",
      }),
  }),
);

export const updatePasswordResolver = zodResolver(
  z
    .object({
      current_password: z.string().min(8, {
        message: "account.security.form.errors.current_password_required",
      }),
      password: z
        .string()
        .min(8, { message: "authentication.errors.password_too_short" }),
      password_confirmation: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.password_confirmation) {
        ctx.addIssue({
          code: "custom",
          message: "authentication.errors.password_mismatch",
          path: ["password_confirmation"],
        });
      }
    }),
);
