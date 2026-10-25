/**
 * Parámetros Globales del Sistema de Gestión para Cooperativa Financiera
 * Basado en el Análisis de Requerimientos v1.0 y las Historias de Usuario (HU-01 a HU-56)
 */

export const PROJECT_PARAMETERS = {
  // Moneda e Identidad
  CURRENCY: {
    DEFAULT: 'MXN',
    NAME: 'Pesos Mexicanos',
    SYMBOL: '$',
  },

  // E1. Acceso y Seguridad
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: 5,             // Intentos fallidos antes de bloqueo
    ACCOUNT_LOCK_MINUTES: 15,          // Duración de bloqueo temporal (minutos)
    PASSWORD_MIN_LENGTH: 8,            // Longitud mínima
    SESSION_TIMEOUT_MINUTES: 30,       // Inactividad máxima
    DOCUMENT_STORAGE_ENCRYPTED: true,  // Cifrado obligatorio de expedientes
  },

  // E3. Atención y Turnos (Ponderación de prioridad)
  QUEUE_PRIORITY: {
    LOAN_REQUEST: 10,       // Trámites de préstamos / productos (máxima prioridad)
    ACCOUNT_OPENING: 8,     // Apertura de cuenta / onboarding
    CASHIER_OPERATION: 5,   // Depósitos / retiros / pagos
    GENERAL_INQUIRY: 3,     // Consultas informativas
  },

  // E4. Rendimientos e Intereses de Débito y Ahorro
  INTEREST_RATES: {
    DEFAULT_INFLATION_BENCHMARK: 0.05, // Referencia inflacionaria (~5.0% anual)
    DAY_COUNT_CONVENTION: 360,          // Base cálculo comercial (360 o 365 días)
    MIN_SEGMENTS: 5,                    // Mínimo de segmentos de tasa por plan
    MAX_SEGMENTS: 7,                    // Máximo de segmentos de tasa por plan
  },

  // E6. Evaluación Crediticia y Préstamos
  LOANS: {
    MAX_DEBT_TO_INCOME_RATIO: 0.40,    // 40% máximo de ingresos comprometidos
    SUPERVISOR_APPROVAL_THRESHOLD: 50000.00, // Préstamos > $50,000 requieren supervisión
    ALLOW_EARLY_PAYMENT: true,         // Permite pagos adelantados con recálculo
  },

  // E8. Cobranza y Cartera Vencida
  COLLECTIONS: {
    RECOVERABLE_MAX_DAYS: 60,          // 1 a 2 meses (<= 60 días) = Cartera recuperable
    DEFAULTED_THRESHOLD_DAYS: 61,      // > 60 días = Cartera vencida no recuperable
    CALCULATE_ON_BUSINESS_DAYS: true,  // Cómputo basado en días hábiles
    AUTO_GENERATE_EXCEL_REPORT: true,  // Reporte mensual automatizado
  },

  // E9. Programa de Lealtad y Puntos
  LOYALTY: {
    POINTS_PER_PESO_REDEMPTION: 100,   // 100 puntos = $1.00 MXN
    POINTS_FOR_CONSECUTIVE_SAVINGS: 50,// Puntos por ahorro mensual constante
    ALLOW_RATE_DISCOUNT_REDEMPTION: true, // Canje por reducción de tasa de interés
  },

  // E12. Modelo de Proyección Financiera
  PROJECTION_MODEL: {
    SCENARIOS: ['BASE', 'OPTIMISTIC', 'ADVERSE'] as const,
    DEFAULT_ADVERSE_DEFAULT_RATE: 0.12, // 12% morosidad estimada en escenario adverso
    HORIZON_BLOCKS: ['WEEKLY', 'QUARTERLY', 'ANNUAL'] as const,
  },
} as const;

export type ProjectParameters = typeof PROJECT_PARAMETERS;
