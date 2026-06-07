export const calculateFinalSalary = (
  baseSalary: number,
  bonus: number,
  tax: number,
  deductions: number,
): number => {
  const gross = baseSalary + bonus;
  const net = gross - tax - deductions;
  return Math.max(0, Math.round(net * 100) / 100);
};
