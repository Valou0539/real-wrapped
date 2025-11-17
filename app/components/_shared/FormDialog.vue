<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissableMask
    :draggable="false"
    :header="header"
    @hide="onDialogHide"
    class="w-lg mx-4"
  >
    <slot
      :close-dialog="closeDialog"
      :on-dialog-hide="onDialogHide"
      :loading="loading"
    />
  </Dialog>
</template>

<script lang="ts" setup>
const visible = defineModel<boolean>("visible");

defineProps<{
  header: string;
  loading?: boolean;
}>();

const emit = defineEmits<{ (e: "hide"): void }>();

const closeDialog = () => {
  visible.value = false;
  onDialogHide();
};

const onDialogHide = () => {
  emit("hide");
};
</script>
