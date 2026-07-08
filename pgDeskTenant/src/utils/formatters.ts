export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function formatDate(date: string | Date): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonthYear(date: string | Date): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}
