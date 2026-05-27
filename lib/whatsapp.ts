import { digitsOnly } from '@/lib/phone';

export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message: string,
): string | null {
  const digits = digitsOnly(phone ?? '');
  if (digits.length < 10) return null;

  const normalized = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildProfileContactMessage(viewerName: string): string {
  return `Olá, eu sou ${viewerName}. Entro em contato com você para falar sobre...`;
}
