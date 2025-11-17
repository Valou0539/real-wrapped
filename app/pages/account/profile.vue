<template>
  <div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
    <h2 class="text-contrast text-base/7 font-semibold">
      {{ $t("account.profile.title") }}
    </h2>
    <p class="text-gray mt-1 text-sm/6">
      {{ $t("account.profile.description") }}
    </p>

    <dl
      class="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5"
    >
      <div class="py-6 sm:flex">
        <dt class="text-contrast font-medium sm:w-64 sm:flex-none sm:pr-6">
          {{ $t("account.profile.fields.name") }}
        </dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <div class="text-gray-900 dark:text-gray-300">
            {{ profile?.name }}
          </div>
          <button
            type="button"
            class="link-primary"
            @click="isNameDialogVisible = true"
          >
            {{ $t("account.profile.actions.update") }}
          </button>
        </dd>
      </div>
      <div class="py-6 sm:flex">
        <dt class="text-contrast font-medium sm:w-64 sm:flex-none sm:pr-6">
          {{ $t("account.profile.fields.email") }}
        </dt>
        <dd class="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
          <div class="text-gray-900 dark:text-gray-300">
            {{ profile?.email }}
            <span
              v-if="profile?.email_being_changed"
              class="text-primary-400 block"
            >
              {{
                $t("account.profile.fields.email_requested", {
                  email: profile?.email_being_changed,
                })
              }}
            </span>
          </div>
          <button
            type="button"
            class="link-primary text-nowrap"
            @click="handleEmailUpdate"
          >
            {{ $t("account.profile.actions.update") }}
          </button>
        </dd>
      </div>
    </dl>

    <AccountUpdateNameDialog v-model:visible="isNameDialogVisible" />
    <AccountUpdateEmailDialog
      v-model:visible="isEmailDialogVisible"
      @new-email-requested="isCheckEmailDialogVisible = true"
    />
    <AccountCheckEmailDialog
      v-if="profile?.email_being_changed"
      v-model:visible="isCheckEmailDialogVisible"
      :email="profile?.email_being_changed"
      @change-email="handleChangeEmail"
    />
  </div>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: $t("account.profile.seo.title"),
  description: $t("account.profile.seo.description"),
});

const profileStore = useProfileStore();
const { profile } = storeToRefs(profileStore);

const isNameDialogVisible = ref(false);
const isEmailDialogVisible = ref(false);
const isCheckEmailDialogVisible = ref(false);

const handleEmailUpdate = () => {
  if (profile.value?.email_being_changed) {
    isCheckEmailDialogVisible.value = true;
  } else {
    isEmailDialogVisible.value = true;
  }
};

const handleChangeEmail = () => {
  isCheckEmailDialogVisible.value = false;
  nextTick(() => {
    isEmailDialogVisible.value = true;
  });
};
</script>
