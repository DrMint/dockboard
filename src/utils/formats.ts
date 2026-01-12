import timeago from "timeago.js";

export const formatBytes = (bytes: number) => {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
};

export const formatUnixTimestamp = (timestamp: number | string | Date, raw?: boolean) => {
  const date =
    typeof timestamp === "object"
      ? timestamp
      : new Date(typeof timestamp === "number" ? timestamp * 1000 : timestamp);
  try {
    return raw ? date.toISOString() : timeago.format(date);
  } catch (error) {
    return "invalid date";
  }
};

export const capitalize = (string: string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const formatLongName = (name: string) => {
  return name.length > 35 ? name.substring(0, 16) + "..." + name.substring(name.length - 16) : name;
};
