/** Extrai apenas dígitos de uma string. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Formata telefone brasileiro enquanto o usuário digita: (99) 98833-4466 */
export function formatBrazilPhone(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Exibe telefone já salvo (com ou sem máscara). */
export function displayBrazilPhone(value: string | null | undefined): string {
  if (!value) return '';
  const digits = digitsOnly(value);
  if (digits.length === 0) return value;
  return formatBrazilPhone(digits);
}

/** Valida telefone com DDD + número (mín. 10 dígitos). */
export function isValidBrazilPhone(value: string): boolean {
  const len = digitsOnly(value).length;
  return len >= 10 && len <= 11;
}
