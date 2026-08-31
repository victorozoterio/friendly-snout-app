/**
 * Utilitários defensivos para manipulação e formatação segura de datas
 * protegendo a aplicação contra exceções runtime (TypeError, NaN) caso o backend
 * retorne valores nulos, vazios ou malformatados.
 */

export function safeCapitalize(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') return 'Não informado';
  const trimmed = value.trim();
  if (!trimmed) return 'Não informado';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function safeFormatDate(value: string | null | undefined): string {
  if (!value) return 'Não informado';

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data inválida';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  } catch {
    return 'Data inválida';
  }
}

export function safeFormatBirthDate(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') return 'Não informado';

  const dateMatch = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return 'Não informado';

  const [, year, month, day] = dateMatch;
  return `${day}/${month}/${year}`;
}

export function safeFormatAge(birthDate: string | null | undefined): string {
  if (!birthDate || typeof birthDate !== 'string') return '';

  const dateMatch = birthDate.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return '';

  const [, yearStr, monthStr, dayStr] = dateMatch;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const birth = new Date(year, month - 1, day);
  const now = new Date();

  if (Number.isNaN(birth.getTime())) return '';

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 1) return 'menos de 1 mês';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const yearsLabel = years > 0 ? `${years} ${years === 1 ? 'ano' : 'anos'}` : '';
  const monthsLabel = remainingMonths > 0 ? `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : '';

  if (yearsLabel && monthsLabel) return `${yearsLabel} e ${monthsLabel}`;
  return yearsLabel || monthsLabel;
}
