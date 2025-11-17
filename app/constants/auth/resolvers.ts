import { zodResolver } from "@primevue/forms/resolvers/zod";
import z from "zod";

export const signUpResolver = zodResolver(
  z.object({
    name: z
      .string()
      .nonempty({ message: "authentication.errors.username_required" }),
    email: z
      .string()
      .nonempty({ message: "authentication.errors.email_required" })
      .email({ message: "authentication.errors.email_invalid" }),
    password: z
      .string()
      .min(8, { message: "authentication.errors.password_too_short" }),
    consent: z.literal(true, {
      errorMap: () => {
        return { message: "authentication.errors.consent_required" };
      },
    }),
  }),
);

export const loginResolver = zodResolver(
  z.object({
    identifier: z
      .string()
      .nonempty({ message: "authentication.errors.username_required" }),
    password: z
      .string()
      .min(8, { message: "authentication.errors.password_too_short" }),
    remember: z.boolean(),
  }),
);

export const forgotPasswordEmailResolver = zodResolver(
  z.object({
    email: z
      .string()
      .nonempty({ message: "authentication.errors.email_required" })
      .email({ message: "authentication.errors.email_invalid" }),
  }),
);

export const forgotPasswordPasswordResolver = zodResolver(
  z
    .object({
      code: z
        .string()
        .length(8, {
          message: "authentication.errors.verification_code_length_8",
        })
        .regex(/^\d{8}$/, {
          message: "authentication.errors.verification_code_length_8",
        }),
      password: z
        .string()
        .min(8, { message: "authentication.errors.password_too_short" }),
      password_confirmation: z
        .string()
        .min(8, { message: "authentication.errors.password_too_short" }),
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

export const verifyEmailResolver = zodResolver(
  z.object({
    code: z
      .string()
      .length(6, {
        message: "authentication.errors.verification_code_length",
      })
      .regex(/^\d{6}$/, {
        message: "authentication.errors.verification_code_length",
      }),
  }),
);

export const forgotPasswordCodeResolver = zodResolver(
  z.object({
    code: z
      .string()
      .length(8, {
        message: "authentication.errors.verification_code_length_8",
      })
      .regex(/^\d{8}$/, {
        message: "authentication.errors.verification_code_length_8",
      }),
  }),
);
