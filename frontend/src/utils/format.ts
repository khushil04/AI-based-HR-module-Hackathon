export const formatDate = (value: string) => new Date(value).toLocaleDateString();

export const formatTime = (value?: string) =>
  value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

export const employeeLabel = (
  employeeId: { firstName: string; lastName: string } | string,
): string => {
  if (typeof employeeId === "string") return employeeId;
  return `${employeeId.firstName} ${employeeId.lastName}`;
};
