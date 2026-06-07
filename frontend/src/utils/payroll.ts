export const calculateFinalSalary = (
  baseSalary: number,
  bonus: number,
  tax: number,
  deductions: number,
): number => {
  const net = baseSalary + bonus - tax - deductions;
  return Math.max(0, Math.round(net * 100) / 100);
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

export const monthName = (month: number) =>
  new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" });
