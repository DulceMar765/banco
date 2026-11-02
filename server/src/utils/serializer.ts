/**
 * Serializador seguro para respuestas JSON en Express.
 * Convierte BigInt y objetos Decimal de Prisma a formatos serializables.
 */

// Parche global para BigInt en JSON.stringify
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'bigint') {
    return data.toString() as unknown as T;
  }

  // Soporte para Decimal de Prisma
  if (typeof data === 'object' && data !== null && 'd' in data && 's' in data && 'e' in data) {
    return Number(data.toString()) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item)) as unknown as T;
  }

  if (typeof data === 'object' && !(data instanceof Date)) {
    const serialized: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      serialized[key] = serializeData(val);
    }
    return serialized as T;
  }

  return data;
}

