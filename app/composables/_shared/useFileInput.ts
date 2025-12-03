export const useFileInput = () => {
  const fileInput = useTemplateRef<HTMLInputElement>("fileInput");
  const isDragOver = ref(false);

  const fileEventToInputEvent = (event: Event) => {
    const target = event.target as HTMLInputElement;
    return {
      target: {
        value: target.files,
      },
    };
  };

  const handleDragOver = () => {
    isDragOver.value = true;
  };

  const handleDragLeave = () => {
    isDragOver.value = false;
  };

  const handleDrop = (event: DragEvent, field: any) => {
    isDragOver.value = false;
    const files = event.dataTransfer?.files;
    if (!files) return;

    field.onChange({
      target: {
        value: files,
      },
    });
  };

  const handleFileChange = (event: Event, field: any) => {
    field.onChange(fileEventToInputEvent(event));
  };

  const clearFile = (field: any) => {
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    field.onChange({
      target: {
        value: null,
      },
    });
  };

  return {
    fileInput,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    clearFile,
  };
};
