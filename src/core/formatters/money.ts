/**
 * Utilidades monetarias de alta precisión para Peso Colombiano (COP).
 * Todos los valores se almacenan como enteros en centavos (cents) para evitar
 * cualquier inconsistencia por representación de punto flotante en JavaScript.
 */

/**
 * Convierte un monto en centavos a pesos colombianos (entero).
 */
export function centsToCOP(cents: number): number {
  return Math.round(cents / 100);
}

/**
 * Convierte un valor en pesos colombianos ingresado por el usuario a centavos enteros.
 */
export function copToCents(cop: number): number {
  return Math.round(cop * 100);
}

/**
 * Formatea un valor en centavos al estándar visual colombiano:
 * Ej: 125000000 centavos -> "$ 1.250.000"
 */
export function formatCOP(
  cents: number,
  options?: {
    showDecimals?: boolean;
    showSign?: boolean;
  }
): string {
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const copValue = absCents / 100;

  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: options?.showDecimals ? 2 : 0,
    minimumFractionDigits: options?.showDecimals ? 2 : 0,
  }).format(copValue);

  if (options?.showSign) {
    if (cents > 0) return `+${formatted}`;
    if (isNegative) return `-${formatted}`;
  }

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Convierte un texto escrito por el usuario (ej: "$ 1.250.000" o "1250000") a centavos enteros.
 */
export function parseCOPInput(input: string): number {
  if (!input) return 0;
  // Elimina cualquier carácter que no sea dígito o coma/punto decimal
  const clean = input.replace(/[^\d.,-]/g, '').trim();
  if (!clean) return 0;

  // En Colombia el punto es separador de miles y la coma de decimales (o viceversa según teclado)
  // Normalizamos: si tiene coma, consideramos decimales
  let normalized = clean;
  if (normalized.includes('.') && normalized.includes(',')) {
    // Caso: 1.250.000,50
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (normalized.includes('.')) {
    // Si solo tiene puntos (típico separador de miles en COP: 1.250.000)
    // A menos que sea 1250.50
    const parts = normalized.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      normalized = normalized.replace(/\./g, '');
    }
  } else if (normalized.includes(',')) {
    normalized = normalized.replace(',', '.');
  }

  const num = parseFloat(normalized);
  if (isNaN(num)) return 0;
  return copToCents(num);
}
