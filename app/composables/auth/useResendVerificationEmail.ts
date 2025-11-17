export const useResendVerificationEmail = () => {
  const toast = useToast();
  const loading = ref(false);

  const resend = (email: string) => {
    loading.value = true;
    return useResendVerificationEmailRequest().execute(
      { email },
      {
        onResponse: ({ response }) => {
          loading.value = false;
          if (response.ok) {
            toast.add({
              severity: "success",
              summary: $t(
                "authentication.verify-email.resend_code_success.summary",
              ),
              detail: $t(
                "authentication.verify-email.resend_code_success.detail",
              ),
              life: 5000,
            });
          }
        },
        onResponseError: () => {
          loading.value = false;
          toast.add({
            severity: "error",
            summary: $t(
              "authentication.errors.resend_verification_email.summary",
            ),
            detail: $t(
              "authentication.errors.resend_verification_email.detail",
            ),
            life: 5000,
          });
        },
      },
    );
  };

  return { resend, loading };
};
