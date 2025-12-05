export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h${remainingMinutes.toString().padStart(2, "0")}`;
  }
  return `${minutes}m`;
};

export const formatDate = (
  dateString: string,
  locale: Intl.LocalesArgument = "en-US",
  formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  },
): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
};
