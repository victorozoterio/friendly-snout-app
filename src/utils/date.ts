/**
 * Utilitários defensivos para manipulação e formatação segura de datas
 * protegendo a aplicação contra exceções runtime (TypeError, NaN) caso o backend
 * retorne valores nulos, vazios ou malformatados.
 */

/**
 * Capitaliza um texto não vazio e fornece um rótulo seguro para dados ausentes.
 */
export function safeCapitalize(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') return 'Não informado';
  const trimmed = value.trim();
  if (!trimmed) return 'Não informado';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Formata uma data ISO em DD/MM/AAAA sem permitir que valores inválidos quebrem a tela.
 */
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

/**
 * Formata somente a parcela de data de um nascimento retornado pela API.
 */
export function safeFormatBirthDate(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') return 'Não informado';

  const dateMatch = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!dateMatch) return 'Não informado';

  const [, year, month, day] = dateMatch;
  return `${day}/${month}/${year}`;
}

/**
 * Calcula a idade legível a partir da data de nascimento, em anos e meses completos.
 */
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

/**
 * Verifica se um valor DD/MM/AAAA representa uma data existente no calendário.
 */
export function isValidBrazilianDate(value: string): boolean {
  const dateMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!dateMatch) return false;

  const [, dayValue, monthValue, yearValue] = dateMatch;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Informa se uma data DD/MM/AAAA é posterior ao fim do dia de referência.
 */
export function isFutureBrazilianDate(value: string, referenceDate = new Date()): boolean {
  if (!isValidBrazilianDate(value)) return false;

  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  const endOfReferenceDay = new Date(referenceDate);
  endOfReferenceDay.setHours(23, 59, 59, 999);

  return date > endOfReferenceDay;
}
