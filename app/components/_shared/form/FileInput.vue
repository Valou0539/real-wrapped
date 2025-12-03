<template>
  <FormField :name="name" v-slot="$field">
    <label
      :for="inputId"
      :class="[
        'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-200',
        {
          'border-red-500 bg-red-50 dark:bg-red-950/20': $field?.invalid,
          'border-primary-500 bg-primary-50 dark:bg-primary-950/20':
            isDragOver && !$field?.invalid,
          'hover:border-primary-400 dark:hover:border-primary-500 border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-neutral-900':
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

      <div v-if="!$field.value" class="flex flex-col items-center gap-4">
        <div class="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4">
          <component
            :is="iconUnselected"
            class="text-primary-600 dark:text-primary-400 h-8 w-8"
          />
        </div>

        <div class="text-center">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ title }}
          </p>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ hint }}
          </p>
        </div>
      </div>

      <div v-else class="flex w-full items-center gap-4">
        <div
          class="bg-primary-100 dark:bg-primary-900/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
        >
          <component
            :is="iconSelected"
            class="text-primary-600 dark:text-primary-400 h-6 w-6"
          />
        </div>

        <div class="flex-1 overflow-hidden">
          <p
            class="truncate text-sm font-medium text-gray-900 dark:text-gray-100 text-wrap"
          >
            {{
              Array.from<File>($field.value as FileList)
                .map((file: File) => file.name)
                .join(", ")
            }}
          </p>
        </div>

        <Button
          type="button"
          severity="secondary"
          text
          rounded
          icon="pi pi-times"
          :aria-label="$t('primevue.cancel')"
          @click.stop="clearFile($field)"
        />
      </div>
    </label>
  </FormField>
</template>

<script lang="ts" setup>
import { DocumentArrowDownIcon, DocumentIcon } from "@heroicons/vue/24/outline";
import type { Component } from "vue";

withDefaults(
  defineProps<{
    name: string;
    title: string;
    hint: string;
    multiple?: boolean;
    accept?: string;
    iconSelected?: Component;
    iconUnselected?: Component;
  }>(),
  {
    iconSelected: DocumentIcon,
    iconUnselected: DocumentArrowDownIcon,
  },
);

const inputId = useId();

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
