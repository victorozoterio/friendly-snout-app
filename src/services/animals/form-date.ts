/**
 * Converte uma data DD/MM/AAAA do formulário no formato ISO aceito pela API.
 */
export function toApiBirthDate(value: string): string | undefined {
  if (!value) return undefined;

  const [day, month, year] = value.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Converte a data ISO retornada pela API no formato DD/MM/AAAA do formulário.
 */
export function toFormBirthDate(value: string | null): string {
  if (!value) return '';

  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
}
