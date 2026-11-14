<template>
  <Select
    v-if="isWrapped || availableYears.length"
    ref="selectRef"
    :model-value="isImporting ? undefined : selectedYear"
    :options="availableYears"
    :disabled="isSelectorDisabled"
    :placeholder="$t('music-history.year.placeholder')"
    :aria-label="$t('music-history.year.label')"
    :pt="{
      root: {
        class:
          'h-11! rounded-full! border-wrapped-fg/25! bg-transparent! text-wrapped-fg! font-wrapped text-base! font-medium! px-4 gap-2',
      },
      label: { class: 'text-wrapped-fg! font-medium' },
      dropdown: { class: 'text-wrapped-fg! w-auto!' },
      overlay: {
        class: 'bg-wrapped-card! border! border-wrapped-fg/20! rounded-2xl!',
      },
      list: { class: 'font-wrapped' },
      option: {
        class: 'text-wrapped-fg! hover:bg-wrapped-fg/10!',
      },
    }"
    @update:model-value="onSelect"
  >
    <template #footer>
      <div class="border-wrapped-fg/15 border-t p-2">
        <button
          type="button"
          class="ui-btn w-full"
          :disabled="isSelectorDisabled"
          @click.stop="onNewYear"
        >
          {{ $t("music-history.year.new") }}
        </button>
      </div>
    </template>
  </Select>
</template>

<script lang="ts" setup>
const emit = defineEmits<{ action: [] }>();

const { isWrapped } = storeToRefs(useWrappedStore());
const { isImporting } = storeToRefs(useMusicHistoryStore());
const {
  availableYears,
  selectedYear,
  isSelectorDisabled,
  selectYear,
  beginImport,
} = useHistoryLibrary();

const selectRef = ref<{ hide: () => void } | null>(null);

const onSelect = (year: number) => {
  selectYear(year);
  emit("action");
};

const onNewYear = () => {
  beginImport();
  selectRef.value?.hide();
  emit("action");
};
</script>
