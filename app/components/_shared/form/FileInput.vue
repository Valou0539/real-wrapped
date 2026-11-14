<template>
  <FormField :name="name" v-slot="$field">
    <label
      :for="inputId"
      :class="[
        'relative flex cursor-pointer flex-col items-center justify-center gap-3.5 rounded-[20px] border-2 border-dashed px-6 py-10 text-center transition-all duration-200',
        {
          'border-red-500': $field?.invalid,
          'border-wrapped-fg': isDragOver && !$field?.invalid,
          'border-wrapped-fg/40 hover:border-wrapped-fg/60':
            !isDragOver && !$field?.invalid,
        },
      ]"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop($event, $field)"
    >
      <input
        :id="inputId"
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="sr-only"
        @change="handleFileChange($event, $field)"
      />

      <div v-if="!$field.value" class="flex flex-col items-center gap-3.5">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          aria-hidden="true"
          class="shrink-0"
        >
          <circle cx="32" cy="32" r="30" fill="var(--color-wrapped-fg)" />
          <circle
            cx="32"
            cy="32"
            r="20"
            fill="none"
            stroke="var(--color-wrapped-bg)"
            stroke-width="1.5"
          />
          <circle cx="32" cy="32" r="11" fill="#FF5B2E" />
          <circle cx="32" cy="32" r="3" fill="var(--color-wrapped-bg)" />
        </svg>
        <p class="text-wrapped-fg m-0 text-xl font-bold">{{ title }}</p>
        <p v-if="subtitle" class="text-wrapped-fg/85 m-0 text-base">
          {{ subtitle }}
        </p>
        <p class="text-wrapped-fg/85 m-0 text-[15px] leading-normal">
          {{ hint }}
        </p>
      </div>

      <div v-else class="flex w-full items-center gap-4">
        <div
          class="bg-wrapped-fg/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
        >
          <component :is="iconSelected" class="text-wrapped-orange h-6 w-6" />
        </div>

        <div class="flex-1 overflow-hidden text-left">
          <p class="text-wrapped-fg text-wrap text-sm font-medium">
            {{ fileNames($field.value) }}
          </p>
        </div>

        <button
          type="button"
          class="ui-ib size-9!"
          :aria-label="$t('primevue.cancel')"
          @click.stop.prevent="clearFile($field)"
        >
          <i class="pi pi-times" aria-hidden="true" />
        </button>
      </div>
    </label>
  </FormField>
</template>

<script lang="ts" setup>
import { DocumentIcon } from "@heroicons/vue/24/outline";
import type { Component } from "vue";

withDefaults(
  defineProps<{
    name: string;
    title: string;
    hint: string;
    subtitle?: string;
    multiple?: boolean;
    accept?: string;
    iconSelected?: Component;
    iconUnselected?: Component;
  }>(),
  {
    iconSelected: DocumentIcon,
    iconUnselected: DocumentIcon,
  },
);

const inputId = useId();

const fileNames = (value: unknown): string =>
  Array.from((value as FileList) ?? [])
    .map((file: File) => file.name)
    .join(", ");

const {
  fileInput,
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
  clearFile,
} = useFileInput();
</script>
