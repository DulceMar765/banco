-- ============================================================================
-- Sistema de Gestión para Cooperativa Financiera
-- Esquema relacional para MySQL 8.0.16+ (InnoDB, CHECK constraints activos)
--
-- Diseño aplicado:
--   * Normalización aproximada a 3FN: catálogos, relaciones N:M y datos atómicos.
--   * Integridad referencial con PK/FK, UNIQUE, CHECK e índices.
--   * Libro de movimientos inmutable; el saldo de cuenta es una proyección
--     mantenida por triggers. Las correcciones deben ser movimientos inversos.
--   * Auditoría centralizada en sp_audit_write() y triggers en entidades críticas.
--   * Procedimientos para operaciones que requieren varias escrituras atómicas.
--
-- Antes de producción:
--   * Crear usuarios MySQL con privilegios mínimos; la app no debe tener
--     permisos para modificar directamente saldos ni borrar libros/auditorías.
--   * Definir cifrado de documentos, gestión de llaves, respaldos y política de
--     retención fuera de este esquema. Aquí se guarda la URI/hash del documento,
--     no el archivo INE/RFC en claro.
--   * Configurar días hábiles, segmentos/tasas, catálogo, sucursales y reglas.
--   * El documento fuente deja varios parámetros por confirmar; se modelan como
--     configurables y no se inventan umbrales financieros/regulatorios.
-- ============================================================================

DROP DATABASE IF EXISTS cooperativa_financiera;
CREATE DATABASE cooperativa_financiera
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE cooperativa_financiera;

SET NAMES utf8mb4;
SET time_zone = '-06:00';
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- 1. Catálogos generales, clientes, personal y acceso
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS branches (
    id              SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(120) NOT NULL,
    address         VARCHAR(255) NULL,
    phone           VARCHAR(25) NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customers (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_number VARCHAR(24) NULL UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    middle_name     VARCHAR(100) NULL,
    paternal_surname VARCHAR(100) NOT NULL,
    maternal_surname VARCHAR(100) NULL,
    birth_date      DATE NULL,
    rfc             VARCHAR(13) NULL UNIQUE,
    curp            VARCHAR(18) NULL UNIQUE,
    email           VARCHAR(254) NULL UNIQUE,
    phone           VARCHAR(25) NULL,
    address_line    VARCHAR(255) NULL,
    neighborhood    VARCHAR(100) NULL,
    municipality    VARCHAR(100) NULL,
    state_name      VARCHAR(100) NULL,
    postal_code     VARCHAR(10) NULL,
    status          ENUM('ACTIVE','INACTIVE','BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (rfc IS NULL OR CHAR_LENGTH(TRIM(rfc)) BETWEEN 12 AND 13),
    CHECK (curp IS NULL OR CHAR_LENGTH(TRIM(curp)) = 18),
    INDEX idx_customers_name (paternal_surname, maternal_surname, first_name),
    INDEX idx_customers_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employees (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_number VARCHAR(24) NOT NULL UNIQUE,
    branch_id       SMALLINT UNSIGNED NULL,
    first_name      VARCHAR(100) NOT NULL,
    paternal_surname VARCHAR(100) NOT NULL,
    maternal_surname VARCHAR(100) NULL,
    job_title       VARCHAR(120) NULL,
    hired_on        DATE NULL,
    status          ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_employees_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_employees_branch_status (branch_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
    id              SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(40) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
    id              SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(80) NOT NULL UNIQUE,
    description     VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS app_users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(100) NOT NULL UNIQUE,
    email           VARCHAR(254) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    customer_id     BIGINT UNSIGNED NULL UNIQUE,
    employee_id     BIGINT UNSIGNED NULL UNIQUE,
    is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   DATETIME NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_app_users_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
      ON UPDATE RESTRICT ON DELETE RESTRICT,
    CHECK ((customer_id IS NOT NULL AND employee_id IS NULL)
        OR (customer_id IS NULL AND employee_id IS NOT NULL)),
    INDEX idx_app_users_enabled (is_enabled)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS app_user_roles (
    user_id         BIGINT UNSIGNED NOT NULL,
    role_id         SMALLINT UNSIGNED NOT NULL,
    assigned_by     BIGINT UNSIGNED NULL,
    assigned_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_user_roles_assigner FOREIGN KEY (assigned_by) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id         SMALLINT UNSIGNED NOT NULL,
    permission_id   SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_documents (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT UNSIGNED NOT NULL,
    document_type   ENUM('INE','PROOF_OF_ADDRESS','RFC','TAX_STATUS','OTHER') NOT NULL,
    storage_uri     VARCHAR(700) NOT NULL,
    sha256_hash     CHAR(64) NULL,
    encrypted       BOOLEAN NOT NULL DEFAULT TRUE,
    uploaded_by     BIGINT UNSIGNED NULL,
    uploaded_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_on      DATE NULL,
    status          ENUM('PENDING','VERIFIED','REJECTED','EXPIRED') NOT NULL DEFAULT 'PENDING',
    notes           VARCHAR(500) NULL,
    CONSTRAINT fk_documents_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_documents_customer_type (customer_id, document_type, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_income_records (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT UNSIGNED NOT NULL,
    monthly_amount  DECIMAL(18,2) NOT NULL,
    is_declared     BOOLEAN NOT NULL,
    income_source   VARCHAR(160) NOT NULL,
    verified        BOOLEAN NOT NULL DEFAULT FALSE,
    valid_from      DATE NOT NULL,
    valid_until     DATE NULL,
    evidence_document_id BIGINT UNSIGNED NULL,
    created_by      BIGINT UNSIGNED NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (monthly_amount >= 0),
    CHECK (valid_until IS NULL OR valid_until >= valid_from),
    CONSTRAINT fk_income_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_income_document FOREIGN KEY (evidence_document_id) REFERENCES customer_documents(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_income_creator FOREIGN KEY (created_by) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_income_customer_declared (customer_id, is_declared, valid_from)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_relationships (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT UNSIGNED NOT NULL,
    relative_name   VARCHAR(200) NOT NULL,
    relationship_type VARCHAR(60) NOT NULL,
    phone           VARCHAR(25) NULL,
    notes           VARCHAR(255) NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_relationship_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_relationship_customer (customer_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 2. Productos financieros y solicitudes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS financial_products (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(40) NOT NULL UNIQUE,
    name            VARCHAR(160) NOT NULL,
    product_type    ENUM('DEPOSIT_ACCOUNT','LOAN','INVESTMENT','INSURANCE') NOT NULL,
    description     TEXT NULL,
    minimum_amount  DECIMAL(18,2) NULL,
    maximum_amount  DECIMAL(18,2) NULL,
    minimum_term_days INT UNSIGNED NULL,
    maximum_term_days INT UNSIGNED NULL,
    default_annual_rate DECIMAL(9,6) NULL,
    fixed_benefits  JSON NULL,
    rules           JSON NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (minimum_amount IS NULL OR minimum_amount >= 0),
    CHECK (maximum_amount IS NULL OR maximum_amount >= 0),
    CHECK (minimum_amount IS NULL OR maximum_amount IS NULL OR maximum_amount >= minimum_amount),
    CHECK (minimum_term_days IS NULL OR maximum_term_days IS NULL OR maximum_term_days >= minimum_term_days),
    CHECK (default_annual_rate IS NULL OR default_annual_rate BETWEEN 0 AND 1),
    INDEX idx_products_type_active (product_type, is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_requirements (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id      BIGINT UNSIGNED NOT NULL,
    requirement_name VARCHAR(160) NOT NULL,
    description     VARCHAR(500) NULL,
    is_mandatory    BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    CONSTRAINT fk_product_requirements_product FOREIGN KEY (product_id) REFERENCES financial_products(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE KEY uq_product_requirement (product_id, requirement_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_applications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT UNSIGNED NOT NULL,
    product_id      BIGINT UNSIGNED NOT NULL,
    handled_by_user_id BIGINT UNSIGNED NULL,
    requested_amount DECIMAL(18,2) NULL,
    proposed_annual_rate DECIMAL(9,6) NULL,
    status          ENUM('SUBMITTED','IN_REVIEW','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'SUBMITTED',
    application_data JSON NULL,
    decision_comment VARCHAR(1000) NULL,
    submitted_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at      DATETIME NULL,
    CONSTRAINT fk_product_app_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_product_app_product FOREIGN KEY (product_id) REFERENCES financial_products(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_product_app_handler FOREIGN KEY (handled_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CHECK (requested_amount IS NULL OR requested_amount >= 0),
    CHECK (proposed_annual_rate IS NULL OR proposed_annual_rate BETWEEN 0 AND 1),
    INDEX idx_product_app_status_date (status, submitted_at),
    INDEX idx_product_app_customer (customer_id, submitted_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_application_documents (
    application_id  BIGINT UNSIGNED NOT NULL,
    document_id     BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (application_id, document_id),
    CONSTRAINT fk_product_app_docs_application FOREIGN KEY (application_id) REFERENCES product_applications(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_product_app_docs_document FOREIGN KEY (document_id) REFERENCES customer_documents(id)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_applications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT UNSIGNED NOT NULL,
    product_id      BIGINT UNSIGNED NOT NULL,
    assigned_executive_user_id BIGINT UNSIGNED NULL,
    requested_amount DECIMAL(18,2) NOT NULL,
    term_months     SMALLINT UNSIGNED NOT NULL,
    proposed_annual_rate DECIMAL(9,6) NOT NULL,
    rfc_snapshot    VARCHAR(13) NULL,
    declared_monthly_income_snapshot DECIMAL(18,2) NOT NULL DEFAULT 0,
    requires_supervisor_approval BOOLEAN NOT NULL DEFAULT FALSE,
    status          ENUM('DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','DISBURSED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    submitted_at    DATETIME NULL,
    decision_at     DATETIME NULL,
    decision_comment VARCHAR(1000) NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_app_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_loan_app_product FOREIGN KEY (product_id) REFERENCES financial_products(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_loan_app_executive FOREIGN KEY (assigned_executive_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CHECK (requested_amount > 0),
    CHECK (term_months > 0),
    CHECK (proposed_annual_rate BETWEEN 0 AND 1),
    CHECK (declared_monthly_income_snapshot >= 0),
    INDEX idx_loan_app_status (status, submitted_at),
    INDEX idx_loan_app_customer (customer_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_application_documents (
    application_id  BIGINT UNSIGNED NOT NULL,
    document_id     BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (application_id, document_id),
    CONSTRAINT fk_loan_app_docs_application FOREIGN KEY (application_id) REFERENCES loan_applications(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_loan_app_docs_document FOREIGN KEY (document_id) REFERENCES customer_documents(id)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_approvals (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL UNIQUE,
    supervisor_user_id BIGINT UNSIGNED NOT NULL,
    decision        ENUM('APPROVED','REJECTED') NOT NULL,
    comment         VARCHAR(1000) NOT NULL,
    decided_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_approval_application FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_loan_approval_supervisor FOREIGN KEY (supervisor_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 3. Caja y sesiones de cajero
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cashier_sessions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id       SMALLINT UNSIGNED NOT NULL,
    cashier_user_id BIGINT UNSIGNED NOT NULL,
    opened_by_user_id BIGINT UNSIGNED NOT NULL,
    closed_by_user_id BIGINT UNSIGNED NULL,
    opened_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at       DATETIME NULL,
    opening_cash    DECIMAL(18,2) NOT NULL DEFAULT 0,
    counted_cash    DECIMAL(18,2) NULL,
    notes           VARCHAR(500) NULL,
    status          ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
    open_cashier_key BIGINT UNSIGNED GENERATED ALWAYS AS (CASE WHEN status = 'OPEN' THEN cashier_user_id ELSE NULL END) STORED,
    CONSTRAINT fk_cash_session_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_cash_session_cashier FOREIGN KEY (cashier_user_id) REFERENCES app_users(id)
      ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_cash_session_opener FOREIGN KEY (opened_by_user_id) REFERENCES app_users(id)
      ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_cash_session_closer FOREIGN KEY (closed_by_user_id) REFERENCES app_users(id)
      ON UPDATE RESTRICT ON DELETE SET NULL,
    CHECK (opening_cash >= 0),
    CHECK (counted_cash IS NULL OR counted_cash >= 0),
    CHECK ((status = 'OPEN' AND closed_at IS NULL) OR (status = 'CLOSED' AND closed_at IS NOT NULL)),
    UNIQUE KEY uq_one_open_session_per_cashier (open_cashier_key),
    INDEX idx_cash_session_cashier_status (cashier_user_id, status, opened_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cashier_session_denominations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id      BIGINT UNSIGNED NOT NULL,
    count_stage     ENUM('OPENING','CLOSING') NOT NULL,
    denomination    DECIMAL(8,2) NOT NULL,
    quantity        INT UNSIGNED NOT NULL,
    counted_by_user_id BIGINT UNSIGNED NULL,
    counted_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cash_denomination_session FOREIGN KEY (session_id) REFERENCES cashier_sessions(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_cash_denomination_user FOREIGN KEY (counted_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CHECK (denomination > 0),
    UNIQUE KEY uq_cash_session_denomination (session_id, count_stage, denomination)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 4. Tasas, segmentos de rendimiento y cuentas de depósito
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interest_rate_plans (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(120) NOT NULL,
    inflation_reference_rate DECIMAL(9,6) NOT NULL DEFAULT 0.050000,
    day_count_basis     SMALLINT UNSIGNED NOT NULL DEFAULT 365,
    effective_from      DATE NOT NULL,
    effective_until     DATE NULL,
    status              ENUM('DRAFT','ACTIVE','INACTIVE') NOT NULL DEFAULT 'DRAFT',
    active_plan_key     TINYINT GENERATED ALWAYS AS (CASE WHEN status = 'ACTIVE' THEN 1 ELSE NULL END) STORED,
    created_by_user_id  BIGINT UNSIGNED NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interest_plan_creator FOREIGN KEY (created_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    UNIQUE KEY uq_single_active_interest_plan (active_plan_key),
    CHECK (inflation_reference_rate BETWEEN 0 AND 1),
    CHECK (day_count_basis IN (360,365)),
    CHECK (effective_until IS NULL OR effective_until >= effective_from),
    INDEX idx_interest_plan_dates (status, effective_from, effective_until)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS interest_segments (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plan_id             BIGINT UNSIGNED NOT NULL,
    segment_number      TINYINT UNSIGNED NOT NULL,
    name                VARCHAR(100) NOT NULL,
    criterion_type      ENUM('BALANCE','TENURE') NOT NULL,
    min_balance         DECIMAL(18,2) NULL,
    max_balance         DECIMAL(18,2) NULL,
    min_tenure_days     INT UNSIGNED NULL,
    max_tenure_days     INT UNSIGNED NULL,
    annual_rate         DECIMAL(9,6) NOT NULL,
    priority            SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_interest_segment_plan FOREIGN KEY (plan_id) REFERENCES interest_rate_plans(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE KEY uq_interest_segment_number (plan_id, segment_number),
    CHECK (segment_number BETWEEN 1 AND 7),
    CHECK (annual_rate BETWEEN 0 AND 1),
    CHECK (
      (criterion_type = 'BALANCE' AND min_balance IS NOT NULL AND min_balance >= 0
       AND (max_balance IS NULL OR max_balance > min_balance)
       AND min_tenure_days IS NULL AND max_tenure_days IS NULL)
      OR
      (criterion_type = 'TENURE' AND min_tenure_days IS NOT NULL
       AND (max_tenure_days IS NULL OR max_tenure_days > min_tenure_days)
       AND min_balance IS NULL AND max_balance IS NULL)
    )
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS account_number_sequences (
    sequence_name   VARCHAR(40) PRIMARY KEY,
    next_value      BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO account_number_sequences (sequence_name, next_value) VALUES ('ACCOUNT', 1);

CREATE TABLE IF NOT EXISTS accounts (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_number  VARCHAR(24) NOT NULL UNIQUE,
    customer_id     BIGINT UNSIGNED NOT NULL,
    product_id      BIGINT UNSIGNED NOT NULL,
    balance         DECIMAL(18,2) NOT NULL DEFAULT 0,
    status          ENUM('ACTIVE','BLOCKED','CLOSED') NOT NULL DEFAULT 'ACTIVE',
    opened_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at       DATETIME NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    CONSTRAINT fk_accounts_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_accounts_product FOREIGN KEY (product_id) REFERENCES financial_products(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_accounts_creator FOREIGN KEY (created_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CHECK (balance >= 0),
    CHECK ((status = 'CLOSED' AND closed_at IS NOT NULL) OR status <> 'CLOSED'),
    INDEX idx_accounts_customer_status (customer_id, status),
    INDEX idx_accounts_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS daily_balance_snapshots (
    account_id       BIGINT UNSIGNED NOT NULL,
    snapshot_date    DATE NOT NULL,
    closing_balance  DECIMAL(18,2) NOT NULL,
    captured_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, snapshot_date),
    CONSTRAINT fk_balance_snapshot_account FOREIGN KEY (account_id) REFERENCES accounts(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (closing_balance >= 0),
    INDEX idx_balance_snapshot_date (snapshot_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 5. Transacciones financieras y libro inmutable de movimientos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS financial_transactions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    receipt_number  VARCHAR(50) NOT NULL UNIQUE,
    customer_id     BIGINT UNSIGNED NOT NULL,
    processed_by_user_id BIGINT UNSIGNED NULL,
    cashier_session_id BIGINT UNSIGNED NULL,
    product_application_id BIGINT UNSIGNED NULL,
    transaction_type ENUM('ACCOUNT_DEPOSIT','ACCOUNT_WITHDRAWAL','INTEREST_CREDIT',
                          'LOAN_PAYMENT','LOAN_DISBURSEMENT','INVESTMENT_CONTRIBUTION',
                          'INSURANCE_PAYMENT','PRODUCT_PAYMENT','OTHER') NOT NULL,
    channel         ENUM('COUNTER','MOBILE_APP','WEB','SYSTEM') NOT NULL DEFAULT 'COUNTER',
    payment_method  ENUM('CASH','TRANSFER','DEBIT_CARD','ACCOUNT','OTHER','NONE') NOT NULL DEFAULT 'CASH',
    amount          DECIMAL(18,2) NOT NULL,
    status          ENUM('PENDING','POSTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    notes           VARCHAR(1000) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    posted_at       DATETIME NULL,
    CONSTRAINT fk_transactions_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_transactions_user FOREIGN KEY (processed_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_transactions_cash_session FOREIGN KEY (cashier_session_id) REFERENCES cashier_sessions(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_transactions_product_application FOREIGN KEY (product_application_id) REFERENCES product_applications(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (amount > 0),
    INDEX idx_transactions_customer_date (customer_id, created_at),
    INDEX idx_transactions_type_status_date (transaction_type, status, created_at),
    INDEX idx_transactions_cash_session (cashier_session_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS account_movements (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id  BIGINT UNSIGNED NOT NULL UNIQUE,
    account_id      BIGINT UNSIGNED NOT NULL,
    movement_type   ENUM('DEPOSIT','WITHDRAWAL','INTEREST_CREDIT','LOAN_DISBURSEMENT','ADJUSTMENT') NOT NULL,
    direction       ENUM('CREDIT','DEBIT') NOT NULL,
    amount          DECIMAL(18,2) NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_account_movements_transaction FOREIGN KEY (transaction_id) REFERENCES financial_transactions(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_account_movements_account FOREIGN KEY (account_id) REFERENCES accounts(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (amount > 0),
    INDEX idx_account_movements_account_date (account_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS account_interest_accruals (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id      BIGINT UNSIGNED NOT NULL,
    accrual_date    DATE NOT NULL,
    balance_basis   DECIMAL(18,2) NOT NULL,
    annual_rate     DECIMAL(9,6) NOT NULL,
    day_count_basis SMALLINT UNSIGNED NOT NULL,
    interest_amount DECIMAL(18,8) NOT NULL,
    status          ENUM('PENDING','POSTED') NOT NULL DEFAULT 'PENDING',
    credited_transaction_id BIGINT UNSIGNED NULL,
    credited_at     DATETIME NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interest_accrual_account FOREIGN KEY (account_id) REFERENCES accounts(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_interest_accrual_transaction FOREIGN KEY (credited_transaction_id) REFERENCES financial_transactions(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE KEY uq_interest_account_day (account_id, accrual_date),
    CHECK (balance_basis >= 0),
    CHECK (annual_rate BETWEEN 0 AND 1),
    CHECK (day_count_basis IN (360,365)),
    CHECK (interest_amount >= 0),
    CHECK ((status = 'PENDING' AND credited_at IS NULL)
        OR (status = 'POSTED' AND credited_at IS NOT NULL)),
    INDEX idx_interest_accrual_month_status (accrual_date, status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 6. Turnos y canalización
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS turn_types (
    id              SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(40) NOT NULL UNIQUE,
    name            VARCHAR(120) NOT NULL,
    service_area    ENUM('WINDOW','DESK','CASHIER') NOT NULL,
    priority        SMALLINT NOT NULL DEFAULT 0,
    requires_customer BOOLEAN NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS service_turns (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_id       SMALLINT UNSIGNED NOT NULL,
    customer_id     BIGINT UNSIGNED NULL,
    turn_type_id    SMALLINT UNSIGNED NOT NULL,
    assigned_to_user_id BIGINT UNSIGNED NULL,
    priority_snapshot SMALLINT NOT NULL,
    service_area_snapshot ENUM('WINDOW','DESK','CASHIER') NOT NULL,
    status          ENUM('WAITING','CALLED','IN_SERVICE','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'WAITING',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    called_at       DATETIME NULL,
    started_at      DATETIME NULL,
    completed_at    DATETIME NULL,
    notes           VARCHAR(500) NULL,
    CONSTRAINT fk_turn_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_turn_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_turn_type FOREIGN KEY (turn_type_id) REFERENCES turn_types(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_turn_assignee FOREIGN KEY (assigned_to_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_turn_queue (branch_id, status, priority_snapshot DESC, created_at),
    INDEX idx_turn_customer (customer_id, created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 7. Préstamos, calendario de pagos, cobranza y venta de cartera
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loans (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_application_id BIGINT UNSIGNED NOT NULL UNIQUE,
    contract_number VARCHAR(40) NOT NULL UNIQUE,
    disbursement_transaction_id BIGINT UNSIGNED NOT NULL UNIQUE,
    deposit_account_id BIGINT UNSIGNED NULL,
    principal_amount DECIMAL(18,2) NOT NULL,
    principal_balance DECIMAL(18,2) NOT NULL,
    annual_interest_rate DECIMAL(9,6) NOT NULL,
    term_months     SMALLINT UNSIGNED NOT NULL,
    start_date      DATE NOT NULL,
    maturity_date   DATE NOT NULL,
    status          ENUM('ACTIVE','PAID_OFF','DEFAULTED','CLOSED') NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loans_application FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_loans_disbursement_tx FOREIGN KEY (disbursement_transaction_id) REFERENCES financial_transactions(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_loans_deposit_account FOREIGN KEY (deposit_account_id) REFERENCES accounts(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (principal_amount > 0),
    CHECK (principal_balance >= 0 AND principal_balance <= principal_amount),
    CHECK (annual_interest_rate BETWEEN 0 AND 1),
    CHECK (term_months > 0),
    CHECK (maturity_date >= start_date),
    INDEX idx_loans_status_maturity (status, maturity_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_installments (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_id         BIGINT UNSIGNED NOT NULL,
    installment_number SMALLINT UNSIGNED NOT NULL,
    due_date        DATE NOT NULL,
    scheduled_principal DECIMAL(18,2) NOT NULL DEFAULT 0,
    scheduled_interest DECIMAL(18,2) NOT NULL DEFAULT 0,
    late_fee_due    DECIMAL(18,2) NOT NULL DEFAULT 0,
    principal_paid  DECIMAL(18,2) NOT NULL DEFAULT 0,
    interest_paid   DECIMAL(18,2) NOT NULL DEFAULT 0,
    late_fee_paid   DECIMAL(18,2) NOT NULL DEFAULT 0,
    status          ENUM('OPEN','PARTIAL','PAID') NOT NULL DEFAULT 'OPEN',
    CONSTRAINT fk_installments_loan FOREIGN KEY (loan_id) REFERENCES loans(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE KEY uq_loan_installment_number (loan_id, installment_number),
    CHECK (installment_number > 0),
    CHECK (scheduled_principal >= 0 AND scheduled_interest >= 0 AND late_fee_due >= 0),
    CHECK (scheduled_principal + scheduled_interest + late_fee_due > 0),
    CHECK (principal_paid >= 0 AND interest_paid >= 0 AND late_fee_paid >= 0),
    CHECK (principal_paid <= scheduled_principal AND interest_paid <= scheduled_interest AND late_fee_paid <= late_fee_due),
    INDEX idx_installments_due_status (due_date, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_payments (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_id         BIGINT UNSIGNED NOT NULL,
    transaction_id  BIGINT UNSIGNED NOT NULL UNIQUE,
    total_amount    DECIMAL(18,2) NOT NULL,
    paid_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loan_payments_loan FOREIGN KEY (loan_id) REFERENCES loans(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_loan_payments_transaction FOREIGN KEY (transaction_id) REFERENCES financial_transactions(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (total_amount > 0),
    INDEX idx_loan_payments_loan_date (loan_id, paid_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loan_payment_allocations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_payment_id BIGINT UNSIGNED NOT NULL,
    installment_id  BIGINT UNSIGNED NOT NULL,
    principal_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    interest_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    late_fee_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_alloc_payment FOREIGN KEY (loan_payment_id) REFERENCES loan_payments(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_payment_alloc_installment FOREIGN KEY (installment_id) REFERENCES loan_installments(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (principal_amount >= 0 AND interest_amount >= 0 AND late_fee_amount >= 0),
    CHECK (principal_amount + interest_amount + late_fee_amount > 0),
    INDEX idx_payment_alloc_installment (installment_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS business_calendar (
    calendar_date   DATE PRIMARY KEY,
    is_business_day BOOLEAN NOT NULL,
    description     VARCHAR(160) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS collection_rules (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    minimum_business_days_overdue INT UNSIGNED NOT NULL,
    maximum_business_days_overdue INT UNSIGNED NULL,
    classification  ENUM('RECOVERABLE','NON_RECOVERABLE') NOT NULL,
    effective_from  DATE NOT NULL,
    effective_until DATE NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (maximum_business_days_overdue IS NULL OR maximum_business_days_overdue >= minimum_business_days_overdue),
    CHECK (effective_until IS NULL OR effective_until >= effective_from),
    INDEX idx_collection_rules_effective (is_active, effective_from, effective_until)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS collection_cases (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_id         BIGINT UNSIGNED NOT NULL UNIQUE,
    assigned_collector_user_id BIGINT UNSIGNED NULL,
    classification  ENUM('RECOVERABLE','NON_RECOVERABLE','SOLD') NOT NULL,
    sale_eligibility ENUM('ELIGIBLE','NOT_ELIGIBLE','REVIEW') NOT NULL DEFAULT 'REVIEW',
    business_days_overdue INT UNSIGNED NOT NULL DEFAULT 0,
    last_contact_at DATETIME NULL,
    next_action_at  DATETIME NULL,
    notes           VARCHAR(1000) NULL,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_collection_case_loan FOREIGN KEY (loan_id) REFERENCES loans(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_collection_case_collector FOREIGN KEY (assigned_collector_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_collection_classification (classification, next_action_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS debt_sales (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    collection_case_id BIGINT UNSIGNED NOT NULL,
    buyer_name      VARCHAR(200) NOT NULL,
    sale_price      DECIMAL(18,2) NOT NULL,
    sold_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contract_reference VARCHAR(120) NULL,
    notes           VARCHAR(500) NULL,
    CONSTRAINT fk_debt_sale_case FOREIGN KEY (collection_case_id) REFERENCES collection_cases(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (sale_price >= 0),
    UNIQUE KEY uq_debt_sale_contract (contract_reference)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS collection_reports (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    period_end      DATE NOT NULL,
    generated_by_user_id BIGINT UNSIGNED NULL,
    generated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    row_count       INT UNSIGNED NOT NULL DEFAULT 0,
    CONSTRAINT fk_collection_report_generator FOREIGN KEY (generated_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_collection_report_period (period_end, generated_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS collection_report_rows (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id       BIGINT UNSIGNED NOT NULL,
    loan_id         BIGINT UNSIGNED NOT NULL,
    contract_number VARCHAR(40) NOT NULL,
    customer_id     BIGINT UNSIGNED NOT NULL,
    customer_name   VARCHAR(405) NOT NULL,
    oldest_unpaid_due_date DATE NOT NULL,
    overdue_amount  DECIMAL(18,2) NOT NULL,
    overdue_installments INT UNSIGNED NOT NULL,
    business_days_overdue INT UNSIGNED NOT NULL,
    classification  ENUM('RECOVERABLE','NON_RECOVERABLE','SOLD') NULL,
    sale_eligibility ENUM('ELIGIBLE','NOT_ELIGIBLE','REVIEW') NULL,
    CONSTRAINT fk_collection_report_row_report FOREIGN KEY (report_id) REFERENCES collection_reports(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_collection_report_row_loan FOREIGN KEY (loan_id) REFERENCES loans(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_collection_report_row_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (overdue_amount >= 0),
    UNIQUE KEY uq_collection_report_loan (report_id, loan_id),
    INDEX idx_collection_report_row_class (report_id, classification, sale_eligibility)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 8. Lealtad, catálogo, notificaciones y eventos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loyalty_settings (
    singleton_id    TINYINT UNSIGNED PRIMARY KEY,
    points_per_currency_unit SMALLINT UNSIGNED NOT NULL DEFAULT 100,
    CHECK (singleton_id = 1),
    CHECK (points_per_currency_unit > 0)
) ENGINE=InnoDB;
INSERT IGNORE INTO loyalty_settings (singleton_id, points_per_currency_unit) VALUES (1, 100);

CREATE TABLE IF NOT EXISTS loyalty_accounts (
    customer_id     BIGINT UNSIGNED PRIMARY KEY,
    points_balance  BIGINT NOT NULL DEFAULT 0,
    enrolled_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status          ENUM('ACTIVE','SUSPENDED','CLOSED') NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_loyalty_account_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (points_balance >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loyalty_earning_rules (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(40) NOT NULL UNIQUE,
    name            VARCHAR(120) NOT NULL,
    event_type      ENUM('SAVINGS_CONSISTENCY','PRODUCT_USE','PROMOTION','MANUAL') NOT NULL,
    points_per_100_currency DECIMAL(10,4) NULL,
    fixed_points    INT UNSIGNED NULL,
    effective_from  DATE NOT NULL,
    effective_until DATE NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (points_per_100_currency IS NULL OR points_per_100_currency >= 0),
    CHECK (fixed_points IS NULL OR fixed_points >= 0),
    CHECK (effective_until IS NULL OR effective_until >= effective_from)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loyalty_movements (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT UNSIGNED NOT NULL,
    points_delta    BIGINT NOT NULL,
    movement_type   ENUM('EARN','REDEEM','ADJUSTMENT','EXPIRATION') NOT NULL,
    description     VARCHAR(300) NOT NULL,
    related_redemption_id BIGINT UNSIGNED NULL UNIQUE,
    related_transaction_id BIGINT UNSIGNED NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loyalty_movement_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_loyalty_movement_transaction FOREIGN KEY (related_transaction_id) REFERENCES financial_transactions(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_loyalty_movement_creator FOREIGN KEY (created_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CHECK (points_delta <> 0),
    INDEX idx_loyalty_customer_date (customer_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS suppliers (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(180) NOT NULL,
    tax_id          VARCHAR(20) NULL,
    contact_name    VARCHAR(150) NULL,
    email           VARCHAR(254) NULL,
    phone           VARCHAR(25) NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_supplier_tax_id (tax_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS catalog_seasons (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL UNIQUE,
    starts_on       DATE NOT NULL,
    ends_on         DATE NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (ends_on >= starts_on)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loyalty_catalog_items (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    supplier_id     BIGINT UNSIGNED NULL,
    season_id       BIGINT UNSIGNED NULL,
    code            VARCHAR(40) NOT NULL UNIQUE,
    name            VARCHAR(180) NOT NULL,
    description     VARCHAR(500) NULL,
    points_cost     BIGINT UNSIGNED NOT NULL,
    stock_quantity  INT UNSIGNED NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_catalog_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_catalog_season FOREIGN KEY (season_id) REFERENCES catalog_seasons(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CHECK (points_cost > 0),
    INDEX idx_catalog_active_season (is_active, season_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loyalty_redemptions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT UNSIGNED NOT NULL,
    catalog_item_id BIGINT UNSIGNED NOT NULL,
    quantity        INT UNSIGNED NOT NULL DEFAULT 1,
    points_redeemed BIGINT UNSIGNED NOT NULL,
    status          ENUM('APPROVED','FULFILLED','CANCELLED') NOT NULL DEFAULT 'APPROVED',
    requested_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at    DATETIME NULL,
    CONSTRAINT fk_redemption_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_redemption_item FOREIGN KEY (catalog_item_id) REFERENCES loyalty_catalog_items(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CHECK (quantity > 0 AND points_redeemed > 0),
    INDEX idx_redemption_customer_date (customer_id, requested_at)
) ENGINE=InnoDB;

ALTER TABLE loyalty_movements
  ADD CONSTRAINT fk_loyalty_movement_redemption
  FOREIGN KEY (related_redemption_id) REFERENCES loyalty_redemptions(id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS promotions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(180) NOT NULL,
    message         VARCHAR(2000) NOT NULL,
    starts_at       DATETIME NOT NULL,
    ends_at         DATETIME NOT NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    status          ENUM('DRAFT','ACTIVE','ENDED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_promotion_creator FOREIGN KEY (created_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CHECK (ends_at >= starts_at),
    INDEX idx_promotions_status_dates (status, starts_at, ends_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_notifications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     BIGINT UNSIGNED NOT NULL,
    promotion_id    BIGINT UNSIGNED NULL,
    title           VARCHAR(180) NOT NULL,
    message         VARCHAR(2000) NOT NULL,
    notification_type ENUM('PROMOTION','PAYMENT_REMINDER','ACCOUNT_ALERT','EVENT','GENERAL') NOT NULL,
    status          ENUM('QUEUED','SENT','READ','FAILED') NOT NULL DEFAULT 'QUEUED',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at         DATETIME NULL,
    read_at         DATETIME NULL,
    CONSTRAINT fk_notification_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_notification_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_notifications_customer_status (customer_id, status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS education_events (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(180) NOT NULL,
    description     TEXT NULL,
    location        VARCHAR(255) NULL,
    starts_at       DATETIME NOT NULL,
    ends_at         DATETIME NOT NULL,
    capacity        INT UNSIGNED NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    status          ENUM('PLANNED','PUBLISHED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'PLANNED',
    CONSTRAINT fk_event_creator FOREIGN KEY (created_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CHECK (ends_at >= starts_at),
    INDEX idx_events_status_start (status, starts_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS education_event_attendees (
    event_id        BIGINT UNSIGNED NOT NULL,
    customer_id     BIGINT UNSIGNED NOT NULL,
    registration_status ENUM('REGISTERED','ATTENDED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'REGISTERED',
    registered_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, customer_id),
    CONSTRAINT fk_event_attendee_event FOREIGN KEY (event_id) REFERENCES education_events(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_event_attendee_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 9. Modelo de proyección financiera
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projection_models (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(180) NOT NULL,
    description     VARCHAR(1000) NULL,
    initial_investment DECIMAL(18,2) NOT NULL,
    block_type      ENUM('WEEKLY','QUARTERLY','ANNUAL') NOT NULL,
    horizon_start   DATE NOT NULL,
    horizon_end     DATE NOT NULL,
    annual_rate     DECIMAL(9,6) NOT NULL,
    operating_cost_per_block DECIMAL(18,2) NOT NULL DEFAULT 0,
    assumptions     JSON NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projection_creator FOREIGN KEY (created_by_user_id) REFERENCES app_users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CHECK (initial_investment >= 0 AND operating_cost_per_block >= 0),
    CHECK (annual_rate BETWEEN -1 AND 1),
    CHECK (horizon_end >= horizon_start)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projection_scenarios (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    model_id        BIGINT UNSIGNED NOT NULL,
    scenario_type   ENUM('BASE','OPTIMISTIC','ADVERSE') NOT NULL,
    name            VARCHAR(120) NOT NULL,
    revenue_factor  DECIMAL(9,6) NOT NULL DEFAULT 1.000000,
    default_rate    DECIMAL(9,6) NOT NULL DEFAULT 0.000000,
    assumptions     JSON NULL,
    CONSTRAINT fk_projection_scenario_model FOREIGN KEY (model_id) REFERENCES projection_models(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE KEY uq_projection_scenario (model_id, scenario_type),
    CHECK (revenue_factor >= 0),
    CHECK (default_rate BETWEEN 0 AND 1)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projection_results (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    scenario_id     BIGINT UNSIGNED NOT NULL,
    block_number    INT UNSIGNED NOT NULL,
    block_start     DATE NOT NULL,
    block_end       DATE NOT NULL,
    projected_revenue DECIMAL(18,2) NOT NULL DEFAULT 0,
    projected_expenses DECIMAL(18,2) NOT NULL DEFAULT 0,
    projected_net_cash_flow DECIMAL(18,2) NOT NULL DEFAULT 0,
    projected_cumulative_value DECIMAL(18,2) NOT NULL DEFAULT 0,
    calculated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projection_result_scenario FOREIGN KEY (scenario_id) REFERENCES projection_scenarios(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE KEY uq_projection_result_block (scenario_id, block_number),
    CHECK (block_number > 0),
    CHECK (block_end >= block_start)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 10. Bitácora de auditoría
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor_user_id   BIGINT UNSIGNED NULL,
    entity_name     VARCHAR(80) NOT NULL,
    entity_pk       VARCHAR(100) NOT NULL,
    action          ENUM('INSERT','UPDATE','DELETE','AUTHORIZE','REJECT') NOT NULL,
    old_data        JSON NULL,
    new_data        JSON NULL,
    connection_id   BIGINT UNSIGNED NOT NULL,
    occurred_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_entity (entity_name, entity_pk, occurred_at),
    INDEX idx_audit_actor_date (actor_user_id, occurred_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 11. Roles y permisos iniciales (los permisos efectivos se validan en la app
--     y deben complementarse con privilegios mínimos de MySQL).
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO roles (code, name, description) VALUES
 ('ADMIN','Administrador','Gestiona trabajadores, roles, reglas y productos'),
 ('SUPERVISOR','Supervisor','Autoriza operaciones que requieren validación'),
 ('EXECUTIVE','Ejecutivo de escritorio','Gestiona clientes y solicitudes de productos'),
 ('CASHIER','Cajero','Registra operaciones de caja'),
 ('ROUTING','Personal de canalización','Asigna turnos y canaliza atención'),
 ('COLLECTIONS','Cobranza','Gestiona cartera y seguimientos'),
 ('CUSTOMER','Socio','Consulta productos y recibe notificaciones');

INSERT IGNORE INTO permissions (code, description) VALUES
 ('customers.read','Consultar clientes'),
 ('customers.write','Registrar y actualizar clientes'),
 ('documents.manage','Administrar documentos de clientes'),
 ('accounts.read','Consultar cuentas y movimientos'),
 ('accounts.deposit','Registrar depósitos'),
 ('accounts.withdraw','Registrar retiros'),
 ('cash.sessions','Administrar sesiones de caja'),
 ('turns.manage','Asignar y gestionar turnos'),
 ('products.manage','Configurar productos y requisitos'),
 ('loans.create','Crear solicitudes de préstamo'),
 ('loans.review','Revisar solicitudes de préstamo'),
 ('loans.approve','Autorizar solicitudes dudosas'),
 ('loans.disburse','Registrar desembolsos'),
 ('collections.manage','Gestionar cartera vencida'),
 ('loyalty.manage','Administrar catálogo y puntos'),
 ('promotions.manage','Crear promociones y notificaciones'),
 ('events.manage','Administrar eventos de educación financiera'),
 ('reports.read','Consultar y exportar reportes'),
 ('users.manage','Administrar usuarios, roles y permisos'),
 ('interest.manage','Configurar tasas y segmentos'),
 ('projections.manage','Configurar y calcular proyecciones');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.code = 'ADMIN';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN
 ('customers.read','customers.write','documents.manage','products.manage','loans.create',
  'loans.review','reports.read') WHERE r.code = 'EXECUTIVE';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN
 ('customers.read','accounts.read','accounts.deposit','accounts.withdraw','cash.sessions','reports.read')
WHERE r.code = 'CASHIER';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('turns.manage','customers.read')
WHERE r.code = 'ROUTING';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('loans.approve','loans.review','reports.read','promotions.manage')
WHERE r.code = 'SUPERVISOR';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('collections.manage','customers.read','reports.read')
WHERE r.code = 'COLLECTIONS';
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN ('accounts.read')
WHERE r.code = 'CUSTOMER';

-- ---------------------------------------------------------------------------
-- 12. Procedimiento centralizado de auditoría
-- ---------------------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_audit_write(
    IN p_entity_name VARCHAR(80),
    IN p_entity_pk VARCHAR(100),
    IN p_action VARCHAR(10),
    IN p_old_data JSON,
    IN p_new_data JSON,
    IN p_actor_user_id BIGINT UNSIGNED
)
BEGIN
    INSERT INTO audit_logs (
        actor_user_id, entity_name, entity_pk, action,
        old_data, new_data, connection_id
    ) VALUES (
        p_actor_user_id, p_entity_name, p_entity_pk, p_action,
        p_old_data, p_new_data, CONNECTION_ID()
    );
END$$

CREATE TRIGGER trg_app_users_after_insert
AFTER INSERT ON app_users
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'app_users', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('username',NEW.username,'email',NEW.email,'customer_id',NEW.customer_id,
                  'employee_id',NEW.employee_id,'is_enabled',NEW.is_enabled),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_app_users_after_update
AFTER UPDATE ON app_users
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'app_users', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('username',OLD.username,'email',OLD.email,'is_enabled',OLD.is_enabled,
                  'password_changed',FALSE),
      JSON_OBJECT('username',NEW.username,'email',NEW.email,'is_enabled',NEW.is_enabled,
                  'password_changed',OLD.password_hash <> NEW.password_hash),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_app_users_no_delete
BEFORE DELETE ON app_users
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Deshabilite el usuario en lugar de borrarlo para conservar la auditoría';
END$$

CREATE TRIGGER trg_financial_products_before_update
BEFORE UPDATE ON financial_products
FOR EACH ROW
BEGIN
    IF NEW.product_type <> OLD.product_type AND (
        EXISTS (SELECT 1 FROM accounts WHERE product_id = OLD.id)
        OR EXISTS (SELECT 1 FROM loan_applications WHERE product_id = OLD.id)
        OR EXISTS (SELECT 1 FROM product_applications WHERE product_id = OLD.id)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede cambiar el tipo de un producto ya utilizado';
    END IF;
END$$

CREATE TRIGGER trg_financial_products_no_delete
BEFORE DELETE ON financial_products
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Desactive el producto en lugar de borrarlo';
END$$

CREATE TRIGGER trg_customer_income_after_insert
AFTER INSERT ON customer_income_records
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'customer_income_records', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('customer_id',NEW.customer_id,'monthly_amount',NEW.monthly_amount,
                  'is_declared',NEW.is_declared,'income_source',NEW.income_source,
                  'verified',NEW.verified,'valid_from',NEW.valid_from,'valid_until',NEW.valid_until),
      NEW.created_by
    );
END$$

CREATE TRIGGER trg_customer_income_after_update
AFTER UPDATE ON customer_income_records
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'customer_income_records', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('monthly_amount',OLD.monthly_amount,'is_declared',OLD.is_declared,
                  'verified',OLD.verified,'valid_from',OLD.valid_from,'valid_until',OLD.valid_until),
      JSON_OBJECT('monthly_amount',NEW.monthly_amount,'is_declared',NEW.is_declared,
                  'verified',NEW.verified,'valid_from',NEW.valid_from,'valid_until',NEW.valid_until),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_customer_income_no_delete
BEFORE DELETE ON customer_income_records
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar historiales de ingresos; cierre su vigencia';
END$$

CREATE TRIGGER trg_financial_products_after_insert
AFTER INSERT ON financial_products
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'financial_products', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('code',NEW.code,'name',NEW.name,'product_type',NEW.product_type,
                  'minimum_amount',NEW.minimum_amount,'maximum_amount',NEW.maximum_amount,
                  'default_annual_rate',NEW.default_annual_rate,'is_active',NEW.is_active),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_financial_products_after_update
AFTER UPDATE ON financial_products
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'financial_products', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('name',OLD.name,'product_type',OLD.product_type,
                  'minimum_amount',OLD.minimum_amount,'maximum_amount',OLD.maximum_amount,
                  'default_annual_rate',OLD.default_annual_rate,'is_active',OLD.is_active),
      JSON_OBJECT('name',NEW.name,'product_type',NEW.product_type,
                  'minimum_amount',NEW.minimum_amount,'maximum_amount',NEW.maximum_amount,
                  'default_annual_rate',NEW.default_annual_rate,'is_active',NEW.is_active),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_collection_cases_after_insert
AFTER INSERT ON collection_cases
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'collection_cases', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('loan_id',NEW.loan_id,'classification',NEW.classification,
                  'sale_eligibility',NEW.sale_eligibility,'business_days_overdue',NEW.business_days_overdue,
                  'assigned_collector_user_id',NEW.assigned_collector_user_id),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_collection_cases_after_update
AFTER UPDATE ON collection_cases
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'collection_cases', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('classification',OLD.classification,'sale_eligibility',OLD.sale_eligibility,
                  'business_days_overdue',OLD.business_days_overdue,'assigned_collector_user_id',OLD.assigned_collector_user_id),
      JSON_OBJECT('classification',NEW.classification,'sale_eligibility',NEW.sale_eligibility,
                  'business_days_overdue',NEW.business_days_overdue,'assigned_collector_user_id',NEW.assigned_collector_user_id),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_collection_cases_no_delete
BEFORE DELETE ON collection_cases
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar expedientes de cobranza; conserve su trazabilidad';
END$$

CREATE TRIGGER trg_interest_plans_after_insert
AFTER INSERT ON interest_rate_plans
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'interest_rate_plans', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('name',NEW.name,'inflation_reference_rate',NEW.inflation_reference_rate,
                  'day_count_basis',NEW.day_count_basis,'effective_from',NEW.effective_from,
                  'effective_until',NEW.effective_until,'status',NEW.status),
      NEW.created_by_user_id
    );
END$$

CREATE TRIGGER trg_interest_plans_after_update
AFTER UPDATE ON interest_rate_plans
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'interest_rate_plans', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('inflation_reference_rate',OLD.inflation_reference_rate,'day_count_basis',OLD.day_count_basis,
                  'effective_from',OLD.effective_from,'effective_until',OLD.effective_until,'status',OLD.status),
      JSON_OBJECT('inflation_reference_rate',NEW.inflation_reference_rate,'day_count_basis',NEW.day_count_basis,
                  'effective_from',NEW.effective_from,'effective_until',NEW.effective_until,'status',NEW.status),
      @app_user_id
    );
END$$

-- Una vez publicado un plan (ACTIVE o INACTIVE), sus segmentos quedan congelados.
-- Para cambiar tasas o rangos, cree una nueva versión en DRAFT.
CREATE TRIGGER trg_interest_segments_before_insert
BEFORE INSERT ON interest_segments
FOR EACH ROW
BEGIN
    DECLARE v_plan_status VARCHAR(10);
    SELECT status INTO v_plan_status
      FROM interest_rate_plans WHERE id = NEW.plan_id;
    IF v_plan_status <> 'DRAFT' THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Solo se pueden agregar segmentos a un plan DRAFT; cree una nueva versión para modificar tasas publicadas';
    END IF;
END$$

CREATE TRIGGER trg_interest_segments_before_update
BEFORE UPDATE ON interest_segments
FOR EACH ROW
BEGIN
    DECLARE v_old_plan_status VARCHAR(10);
    DECLARE v_new_plan_status VARCHAR(10);
    SELECT status INTO v_old_plan_status
      FROM interest_rate_plans WHERE id = OLD.plan_id;
    SELECT status INTO v_new_plan_status
      FROM interest_rate_plans WHERE id = NEW.plan_id;
    IF v_old_plan_status <> 'DRAFT' OR v_new_plan_status <> 'DRAFT' THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Los segmentos publicados son inmutables; cree un nuevo plan DRAFT';
    END IF;
END$$

CREATE TRIGGER trg_interest_segments_after_insert
AFTER INSERT ON interest_segments
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'interest_segments', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('plan_id',NEW.plan_id,'segment_number',NEW.segment_number,'name',NEW.name,
                  'criterion_type',NEW.criterion_type,'min_balance',NEW.min_balance,
                  'max_balance',NEW.max_balance,'min_tenure_days',NEW.min_tenure_days,
                  'max_tenure_days',NEW.max_tenure_days,'annual_rate',NEW.annual_rate,'priority',NEW.priority),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_interest_segments_after_update
AFTER UPDATE ON interest_segments
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'interest_segments', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('annual_rate',OLD.annual_rate,'priority',OLD.priority,'min_balance',OLD.min_balance,
                  'max_balance',OLD.max_balance,'min_tenure_days',OLD.min_tenure_days,'max_tenure_days',OLD.max_tenure_days),
      JSON_OBJECT('annual_rate',NEW.annual_rate,'priority',NEW.priority,'min_balance',NEW.min_balance,
                  'max_balance',NEW.max_balance,'min_tenure_days',NEW.min_tenure_days,'max_tenure_days',NEW.max_tenure_days),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_collection_rules_after_insert
AFTER INSERT ON collection_rules
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'collection_rules', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('name',NEW.name,'minimum_business_days_overdue',NEW.minimum_business_days_overdue,
                  'maximum_business_days_overdue',NEW.maximum_business_days_overdue,
                  'classification',NEW.classification,'effective_from',NEW.effective_from,
                  'effective_until',NEW.effective_until,'is_active',NEW.is_active),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_collection_rules_after_update
AFTER UPDATE ON collection_rules
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'collection_rules', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('minimum_business_days_overdue',OLD.minimum_business_days_overdue,
                  'maximum_business_days_overdue',OLD.maximum_business_days_overdue,
                  'classification',OLD.classification,'is_active',OLD.is_active),
      JSON_OBJECT('minimum_business_days_overdue',NEW.minimum_business_days_overdue,
                  'maximum_business_days_overdue',NEW.maximum_business_days_overdue,
                  'classification',NEW.classification,'is_active',NEW.is_active),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_interest_plan_no_delete
BEFORE DELETE ON interest_rate_plans
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Desactive los planes de tasas; no los borre para conservar trazabilidad';
END$$

CREATE TRIGGER trg_interest_segment_no_delete
BEFORE DELETE ON interest_segments
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar segmentos de tasas; actualice su vigencia o cree un nuevo plan';
END$$

-- Evita que una configuración de tasas se active sin los 5 a 7 segmentos
-- solicitados en el documento. Crear DRAFT, registrar segmentos y activar al final.
CREATE TRIGGER trg_interest_plan_no_direct_active_insert
BEFORE INSERT ON interest_rate_plans
FOR EACH ROW
BEGIN
    IF NEW.status = 'ACTIVE' THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Cree el plan en DRAFT, configure 5 a 7 segmentos y después actívelo';
    END IF;
END$$

CREATE TRIGGER trg_interest_plan_validate_activation
BEFORE UPDATE ON interest_rate_plans
FOR EACH ROW
BEGIN
    DECLARE v_segment_count INT DEFAULT 0;
    DECLARE v_criterion_count INT DEFAULT 0;
    -- Después de publicar, no se reescriben tasas ni vigencias históricas.
    IF OLD.status <> 'DRAFT' AND (
        NEW.name <> OLD.name
        OR NEW.inflation_reference_rate <> OLD.inflation_reference_rate
        OR NEW.day_count_basis <> OLD.day_count_basis
        OR NEW.effective_from <> OLD.effective_from
        OR NOT (NEW.effective_until <=> OLD.effective_until)
    ) THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Un plan publicado no se edita; cree una nueva versión en DRAFT';
    END IF;
    IF NEW.status = 'ACTIVE' AND OLD.status <> 'ACTIVE' THEN
        SELECT COUNT(*), COUNT(DISTINCT criterion_type)
          INTO v_segment_count, v_criterion_count
          FROM interest_segments WHERE plan_id = OLD.id;
        IF v_segment_count < 5 OR v_segment_count > 7 THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'Un plan activo debe tener entre 5 y 7 segmentos';
        END IF;
        IF v_criterion_count <> 1 THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'Todos los segmentos de un plan deben usar el mismo criterio: BALANCE o TENURE';
        END IF;
        IF NEW.effective_until IS NOT NULL AND NEW.effective_until < CURRENT_DATE() THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'No se puede activar un plan cuya vigencia ya terminó';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_cashier_sessions_before_update
BEFORE UPDATE ON cashier_sessions
FOR EACH ROW
BEGIN
    IF OLD.status = 'CLOSED' AND NEW.status <> 'CLOSED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una sesión de caja cerrada no puede reabrirse';
    END IF;
    IF OLD.status = 'OPEN' AND NEW.status = 'CLOSED' THEN
        IF NEW.counted_cash IS NULL OR NEW.closed_by_user_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Para cerrar caja se requiere efectivo contado y usuario de cierre';
        END IF;
        SET NEW.closed_at = COALESCE(NEW.closed_at, CURRENT_TIMESTAMP);
    END IF;
END$$

CREATE TRIGGER trg_cashier_sessions_after_insert
AFTER INSERT ON cashier_sessions
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'cashier_sessions', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('branch_id',NEW.branch_id,'cashier_user_id',NEW.cashier_user_id,
                  'opening_cash',NEW.opening_cash,'status',NEW.status),
      NEW.opened_by_user_id
    );
END$$

CREATE TRIGGER trg_cashier_sessions_after_update
AFTER UPDATE ON cashier_sessions
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'cashier_sessions', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('status',OLD.status,'counted_cash',OLD.counted_cash,'closed_at',OLD.closed_at),
      JSON_OBJECT('status',NEW.status,'counted_cash',NEW.counted_cash,'closed_at',NEW.closed_at),
      NEW.closed_by_user_id
    );
END$$

CREATE TRIGGER trg_product_applications_after_insert
AFTER INSERT ON product_applications
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'product_applications', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('customer_id',NEW.customer_id,'product_id',NEW.product_id,
                  'requested_amount',NEW.requested_amount,'status',NEW.status),
      NEW.handled_by_user_id
    );
END$$

CREATE TRIGGER trg_product_applications_after_update
AFTER UPDATE ON product_applications
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'product_applications', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('status',OLD.status,'decision_comment',OLD.decision_comment),
      JSON_OBJECT('status',NEW.status,'decision_comment',NEW.decision_comment),
      NEW.handled_by_user_id
    );
END$$

CREATE TRIGGER trg_user_roles_after_insert
AFTER INSERT ON app_user_roles
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'app_user_roles', CONCAT(NEW.user_id, ':', NEW.role_id), 'INSERT', NULL,
      JSON_OBJECT('user_id',NEW.user_id,'role_id',NEW.role_id,'assigned_by',NEW.assigned_by),
      COALESCE(NEW.assigned_by, @app_user_id)
    );
END$$

CREATE TRIGGER trg_user_roles_after_delete
AFTER DELETE ON app_user_roles
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'app_user_roles', CONCAT(OLD.user_id, ':', OLD.role_id), 'DELETE',
      JSON_OBJECT('user_id',OLD.user_id,'role_id',OLD.role_id), NULL,
      @app_user_id
    );
END$$

CREATE TRIGGER trg_product_application_documents_before_insert
BEFORE INSERT ON product_application_documents
FOR EACH ROW
BEGIN
    DECLARE v_application_customer BIGINT UNSIGNED;
    DECLARE v_document_customer BIGINT UNSIGNED;
    SELECT customer_id INTO v_application_customer FROM product_applications WHERE id = NEW.application_id;
    SELECT customer_id INTO v_document_customer FROM customer_documents WHERE id = NEW.document_id;
    IF v_application_customer <> v_document_customer THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El documento debe pertenecer al mismo socio de la solicitud';
    END IF;
END$$

CREATE TRIGGER trg_loan_application_documents_before_insert
BEFORE INSERT ON loan_application_documents
FOR EACH ROW
BEGIN
    DECLARE v_application_customer BIGINT UNSIGNED;
    DECLARE v_document_customer BIGINT UNSIGNED;
    SELECT customer_id INTO v_application_customer FROM loan_applications WHERE id = NEW.application_id;
    SELECT customer_id INTO v_document_customer FROM customer_documents WHERE id = NEW.document_id;
    IF v_application_customer <> v_document_customer THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El documento debe pertenecer al mismo socio de la solicitud de préstamo';
    END IF;
END$$

CREATE TRIGGER trg_product_application_type
BEFORE INSERT ON product_applications
FOR EACH ROW
BEGIN
    DECLARE v_type VARCHAR(30);
    DECLARE v_active BOOLEAN;
    SELECT product_type, is_active INTO v_type, v_active FROM financial_products WHERE id = NEW.product_id;
    IF v_type NOT IN ('INVESTMENT','INSURANCE') OR v_active = FALSE THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Seleccione un producto activo de inversión o seguro; los préstamos usan loan_applications';
    END IF;
END$$

CREATE TRIGGER trg_product_application_type_update
BEFORE UPDATE ON product_applications
FOR EACH ROW
BEGIN
    DECLARE v_type VARCHAR(30);
    SELECT product_type INTO v_type FROM financial_products WHERE id = NEW.product_id;
    IF v_type NOT IN ('INVESTMENT','INSURANCE') THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Las solicitudes de inversión/seguro no pueden cambiar a producto de préstamo';
    END IF;
END$$

CREATE TRIGGER trg_customers_no_delete
BEFORE DELETE ON customers
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar socios; cambie su estado para conservar la trazabilidad';
END$$

CREATE TRIGGER trg_loan_application_type
BEFORE INSERT ON loan_applications
FOR EACH ROW
BEGIN
    DECLARE v_type VARCHAR(30);
    DECLARE v_product_active BOOLEAN;
    DECLARE v_customer_rfc VARCHAR(13);
    DECLARE v_declared_income DECIMAL(18,2) DEFAULT 0;
    SELECT product_type, is_active INTO v_type, v_product_active
      FROM financial_products WHERE id = NEW.product_id;
    IF v_type <> 'LOAN' OR v_product_active = FALSE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El producto seleccionado no es un préstamo activo';
    END IF;
    SELECT rfc INTO v_customer_rfc FROM customers WHERE id = NEW.customer_id;
    SELECT COALESCE(SUM(monthly_amount),0) INTO v_declared_income
      FROM customer_income_records
     WHERE customer_id = NEW.customer_id AND is_declared = TRUE
       AND valid_from <= CURRENT_DATE()
       AND (valid_until IS NULL OR valid_until >= CURRENT_DATE());
    SET NEW.rfc_snapshot = v_customer_rfc;
    SET NEW.declared_monthly_income_snapshot = v_declared_income;
END$$

CREATE TRIGGER trg_loan_application_before_update
BEFORE UPDATE ON loan_applications
FOR EACH ROW
BEGIN
    DECLARE v_approved_count INT DEFAULT 0;
    IF NEW.customer_id <> OLD.customer_id OR NEW.product_id <> OLD.product_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El socio y producto de una solicitud no pueden cambiarse; cree otra solicitud';
    END IF;
    IF OLD.status <> 'DRAFT' AND (
       NEW.requested_amount <> OLD.requested_amount OR NEW.term_months <> OLD.term_months
       OR NEW.proposed_annual_rate <> OLD.proposed_annual_rate
       OR NOT (NEW.rfc_snapshot <=> OLD.rfc_snapshot)
       OR NEW.declared_monthly_income_snapshot <> OLD.declared_monthly_income_snapshot
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los datos evaluados quedan congelados al enviar la solicitud';
    END IF;
    IF NEW.status = 'DISBURSED' AND OLD.status <> 'DISBURSED'
       AND COALESCE(@loan_disbursement_complete,0) <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El estado DISBURSED solo puede fijarse desde el flujo transaccional de desembolso';
    END IF;
    IF (OLD.status = 'DRAFT' AND NEW.status NOT IN ('DRAFT','SUBMITTED','CANCELLED'))
       OR (OLD.status = 'SUBMITTED' AND NEW.status NOT IN ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','CANCELLED'))
       OR (OLD.status = 'UNDER_REVIEW' AND NEW.status NOT IN ('UNDER_REVIEW','APPROVED','REJECTED','CANCELLED'))
       OR (OLD.status = 'APPROVED' AND NEW.status NOT IN ('APPROVED','DISBURSED'))
       OR (OLD.status IN ('REJECTED','DISBURSED','CANCELLED') AND NEW.status <> OLD.status) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transición de estado no permitida para la solicitud';
    END IF;
    IF NEW.status = 'APPROVED' AND OLD.status <> 'APPROVED' AND NEW.requires_supervisor_approval = TRUE THEN
        SELECT COUNT(*) INTO v_approved_count
          FROM loan_approvals
         WHERE loan_application_id = OLD.id AND decision = 'APPROVED';
        IF v_approved_count = 0 THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'El préstamo requiere autorización aprobatoria del supervisor';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_loan_approval_before_insert
BEFORE INSERT ON loan_approvals
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(30);
    DECLARE v_executive_id BIGINT UNSIGNED;
    DECLARE v_is_supervisor INT DEFAULT 0;
    SELECT status, assigned_executive_user_id
      INTO v_status, v_executive_id
      FROM loan_applications WHERE id = NEW.loan_application_id;
    IF v_status NOT IN ('SUBMITTED','UNDER_REVIEW') THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'La solicitud debe estar enviada o en revisión para autorizarse';
    END IF;
    IF v_executive_id = NEW.supervisor_user_id THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'El ejecutivo asignado no puede aprobar su propia solicitud';
    END IF;
    SELECT COUNT(*) INTO v_is_supervisor
      FROM app_user_roles ur
      JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = NEW.supervisor_user_id AND r.code IN ('SUPERVISOR','ADMIN');
    IF v_is_supervisor = 0 THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'El usuario aprobador no tiene rol SUPERVISOR o ADMIN';
    END IF;
END$$

CREATE TRIGGER trg_loan_approval_after_insert
AFTER INSERT ON loan_approvals
FOR EACH ROW
BEGIN
    UPDATE loan_applications
       SET status = IF(NEW.decision = 'APPROVED','APPROVED','REJECTED'),
           decision_at = NEW.decided_at,
           decision_comment = NEW.comment
     WHERE id = NEW.loan_application_id;
    CALL sp_audit_write(
      'loan_approvals', CAST(NEW.id AS CHAR),
      IF(NEW.decision = 'APPROVED','AUTHORIZE','REJECT'), NULL,
      JSON_OBJECT('loan_application_id',NEW.loan_application_id,
                  'supervisor_user_id',NEW.supervisor_user_id,
                  'decision',NEW.decision,'comment',NEW.comment),
      NEW.supervisor_user_id
    );
END$$

CREATE TRIGGER trg_loans_before_insert
BEFORE INSERT ON loans
FOR EACH ROW
BEGIN
    DECLARE v_application_status VARCHAR(30);
    DECLARE v_requires_approval BOOLEAN;
    DECLARE v_customer_id BIGINT UNSIGNED;
    DECLARE v_approved_count INT DEFAULT 0;
    DECLARE v_tx_type VARCHAR(30);
    DECLARE v_tx_customer BIGINT UNSIGNED;
    DECLARE v_tx_amount DECIMAL(18,2);
    DECLARE v_tx_status VARCHAR(12);
    SELECT status, requires_supervisor_approval, customer_id
      INTO v_application_status, v_requires_approval, v_customer_id
      FROM loan_applications WHERE id = NEW.loan_application_id;
    IF v_application_status <> 'APPROVED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se puede formalizar una solicitud aprobada';
    END IF;
    IF v_requires_approval THEN
        SELECT COUNT(*) INTO v_approved_count
          FROM loan_approvals
         WHERE loan_application_id = NEW.loan_application_id AND decision = 'APPROVED';
        IF v_approved_count = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Falta la aprobación del supervisor';
        END IF;
    END IF;
    SELECT transaction_type, customer_id, amount, status
      INTO v_tx_type, v_tx_customer, v_tx_amount, v_tx_status
      FROM financial_transactions WHERE id = NEW.disbursement_transaction_id;
    IF v_tx_type <> 'LOAN_DISBURSEMENT' OR v_tx_customer <> v_customer_id
       OR v_tx_amount <> NEW.principal_amount OR v_tx_status <> 'POSTED' THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'La transacción contabilizada de desembolso no coincide con el préstamo';
    END IF;
    IF NEW.deposit_account_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM accounts a WHERE a.id = NEW.deposit_account_id AND a.customer_id = v_customer_id AND a.status = 'ACTIVE'
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta de abono no pertenece al socio del préstamo';
    END IF;
END$$

CREATE TRIGGER trg_loans_after_insert
AFTER INSERT ON loans
FOR EACH ROW
BEGIN
    UPDATE loan_applications SET status = 'DISBURSED' WHERE id = NEW.loan_application_id;
    CALL sp_audit_write(
      'loans', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('loan_application_id',NEW.loan_application_id,
                  'contract_number',NEW.contract_number,
                  'principal_amount',NEW.principal_amount,
                  'annual_interest_rate',NEW.annual_interest_rate,
                  'term_months',NEW.term_months,'status',NEW.status),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_loan_applications_no_delete
BEFORE DELETE ON loan_applications
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar solicitudes; use CANCELLED o REJECTED';
END$$

CREATE TRIGGER trg_loans_no_delete
BEFORE DELETE ON loans
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar contratos de préstamo';
END$$

CREATE TRIGGER trg_loan_installments_no_delete
BEFORE DELETE ON loan_installments
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar parcialidades; conserve el calendario del préstamo';
END$$

-- Operaciones en efectivo solo durante una sesión abierta del cajero asignado.
CREATE TRIGGER trg_financial_transactions_before_insert
BEFORE INSERT ON financial_transactions
FOR EACH ROW
BEGIN
    DECLARE v_session_status VARCHAR(10);
    DECLARE v_session_cashier BIGINT UNSIGNED;
    DECLARE v_application_customer BIGINT UNSIGNED;
    DECLARE v_application_type VARCHAR(30);
    DECLARE v_application_status VARCHAR(20);
    IF NEW.transaction_type IN ('INVESTMENT_CONTRIBUTION','INSURANCE_PAYMENT','PRODUCT_PAYMENT')
       AND NEW.product_application_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La operación debe vincularse con la solicitud del producto';
    END IF;
    IF NEW.product_application_id IS NOT NULL THEN
        SELECT pa.customer_id, fp.product_type, pa.status
          INTO v_application_customer, v_application_type, v_application_status
          FROM product_applications pa JOIN financial_products fp ON fp.id = pa.product_id
         WHERE pa.id = NEW.product_application_id;
        IF v_application_customer <> NEW.customer_id OR v_application_status <> 'APPROVED' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La solicitud asociada debe pertenecer al socio y estar aprobada';
        END IF;
        IF (NEW.transaction_type = 'INVESTMENT_CONTRIBUTION' AND v_application_type <> 'INVESTMENT')
           OR (NEW.transaction_type = 'INSURANCE_PAYMENT' AND v_application_type <> 'INSURANCE') THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El tipo de operación no coincide con el producto solicitado';
        END IF;
    END IF;
    IF NEW.payment_method = 'CASH' THEN
        IF NEW.cashier_session_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una operación en efectivo requiere sesión de caja';
        END IF;
        SELECT status, cashier_user_id INTO v_session_status, v_session_cashier
          FROM cashier_sessions WHERE id = NEW.cashier_session_id FOR UPDATE;
        IF v_session_status <> 'OPEN' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La sesión de caja no está abierta';
        END IF;
        IF NEW.processed_by_user_id IS NULL OR NEW.processed_by_user_id <> v_session_cashier THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El usuario no corresponde al cajero de la sesión';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_financial_transactions_before_update
BEFORE UPDATE ON financial_transactions
FOR EACH ROW
BEGIN
    DECLARE v_movement_count INT DEFAULT 0;
    DECLARE v_movement_amount DECIMAL(18,2) DEFAULT 0;
    DECLARE v_payment_count INT DEFAULT 0;
    DECLARE v_allocation_total DECIMAL(18,2) DEFAULT 0;
    IF OLD.status = 'POSTED' AND (
       NEW.status <> OLD.status OR NEW.customer_id <> OLD.customer_id
       OR NEW.transaction_type <> OLD.transaction_type OR NEW.amount <> OLD.amount
       OR NEW.receipt_number <> OLD.receipt_number OR NEW.created_at <> OLD.created_at
       OR NOT (NEW.processed_by_user_id <=> OLD.processed_by_user_id)
    ) THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Una transacción contabilizada es inmutable; registre una operación compensatoria';
    END IF;
    IF OLD.status = 'CANCELLED' AND NEW.status <> OLD.status THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una transacción cancelada no puede reactivarse';
    END IF;
    IF OLD.status = 'PENDING' AND NEW.status = 'POSTED' THEN
        IF NEW.transaction_type IN ('ACCOUNT_DEPOSIT','ACCOUNT_WITHDRAWAL','INTEREST_CREDIT') THEN
            SELECT COUNT(*), COALESCE(SUM(amount),0)
              INTO v_movement_count, v_movement_amount
              FROM account_movements WHERE transaction_id = NEW.id;
            IF v_movement_count <> 1 OR v_movement_amount <> NEW.amount THEN
                SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'La transacción de cuenta debe tener exactamente un movimiento por el mismo importe';
            END IF;
        END IF;
        IF NEW.transaction_type = 'LOAN_DISBURSEMENT' AND NEW.payment_method = 'ACCOUNT' THEN
            SELECT COUNT(*), COALESCE(SUM(amount),0)
              INTO v_movement_count, v_movement_amount
              FROM account_movements WHERE transaction_id = NEW.id;
            IF v_movement_count <> 1 OR v_movement_amount <> NEW.amount THEN
                SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'El desembolso a cuenta debe tener un movimiento de abono por el importe completo';
            END IF;
        END IF;
        IF NEW.transaction_type = 'LOAN_PAYMENT' AND NEW.payment_method = 'ACCOUNT' THEN
            SELECT COUNT(*), COALESCE(SUM(amount),0)
              INTO v_movement_count, v_movement_amount
              FROM account_movements WHERE transaction_id = NEW.id;
            IF v_movement_count <> 1 OR v_movement_amount <> NEW.amount THEN
                SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'El pago desde saldo debe tener un movimiento de retiro por el importe completo';
            END IF;
        END IF;
        IF NEW.transaction_type = 'LOAN_PAYMENT' THEN
            SELECT COUNT(*) INTO v_payment_count FROM loan_payments WHERE transaction_id = NEW.id;
            SELECT COALESCE(SUM(a.principal_amount + a.interest_amount + a.late_fee_amount),0)
              INTO v_allocation_total
              FROM loan_payment_allocations a
              JOIN loan_payments lp ON lp.id = a.loan_payment_id
             WHERE lp.transaction_id = NEW.id;
            IF v_payment_count <> 1 OR v_allocation_total <> NEW.amount THEN
                SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = 'El pago de préstamo debe estar asignado íntegramente a sus conceptos';
            END IF;
        END IF;
        SET NEW.posted_at = CURRENT_TIMESTAMP;
    END IF;
    IF OLD.status = 'PENDING' AND NEW.status = 'CANCELLED' THEN
        IF EXISTS (SELECT 1 FROM account_movements WHERE transaction_id = OLD.id)
           OR EXISTS (SELECT 1 FROM loan_payments WHERE transaction_id = OLD.id) THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'No se puede cancelar una transacción que ya tiene movimientos; reviértala mediante una operación compensatoria';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_financial_transactions_after_insert
AFTER INSERT ON financial_transactions
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'financial_transactions', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('receipt_number',NEW.receipt_number,'customer_id',NEW.customer_id,
                  'transaction_type',NEW.transaction_type,'product_application_id',NEW.product_application_id,
                  'channel',NEW.channel,'payment_method',NEW.payment_method,'amount',NEW.amount,'status',NEW.status),
      NEW.processed_by_user_id
    );
END$$

CREATE TRIGGER trg_financial_transactions_after_update
AFTER UPDATE ON financial_transactions
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'financial_transactions', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('status',OLD.status,'posted_at',OLD.posted_at,'notes',OLD.notes),
      JSON_OBJECT('status',NEW.status,'posted_at',NEW.posted_at,'notes',NEW.notes),
      NEW.processed_by_user_id
    );
END$$

CREATE TRIGGER trg_financial_transactions_no_delete
BEFORE DELETE ON financial_transactions
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar transacciones; cancele pendientes o registre una operación compensatoria';
END$$

CREATE TRIGGER trg_account_movements_before_insert
BEFORE INSERT ON account_movements
FOR EACH ROW
BEGIN
    DECLARE v_account_customer BIGINT UNSIGNED;
    DECLARE v_account_status VARCHAR(12);
    DECLARE v_tx_customer BIGINT UNSIGNED;
    DECLARE v_tx_type VARCHAR(35);
    DECLARE v_tx_amount DECIMAL(18,2);
    DECLARE v_tx_status VARCHAR(12);
    SELECT customer_id, status INTO v_account_customer, v_account_status
      FROM accounts WHERE id = NEW.account_id;
    SELECT customer_id, transaction_type, amount, status
      INTO v_tx_customer, v_tx_type, v_tx_amount, v_tx_status
      FROM financial_transactions WHERE id = NEW.transaction_id;
    IF v_account_status <> 'ACTIVE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta no está activa';
    END IF;
    IF v_account_customer <> v_tx_customer THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta y la transacción pertenecen a socios distintos';
    END IF;
    IF v_tx_status <> 'PENDING' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El movimiento debe pertenecer a una transacción pendiente';
    END IF;
    IF NEW.amount <> v_tx_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El importe del movimiento debe coincidir con el de la transacción';
    END IF;
    IF NOT (
       (NEW.movement_type = 'DEPOSIT' AND NEW.direction = 'CREDIT' AND v_tx_type = 'ACCOUNT_DEPOSIT') OR
       (NEW.movement_type = 'WITHDRAWAL' AND NEW.direction = 'DEBIT' AND v_tx_type IN ('ACCOUNT_WITHDRAWAL','LOAN_PAYMENT')) OR
       (NEW.movement_type = 'INTEREST_CREDIT' AND NEW.direction = 'CREDIT' AND v_tx_type = 'INTEREST_CREDIT') OR
       (NEW.movement_type = 'LOAN_DISBURSEMENT' AND NEW.direction = 'CREDIT' AND v_tx_type = 'LOAN_DISBURSEMENT') OR
       (NEW.movement_type = 'ADJUSTMENT' AND v_tx_type = 'OTHER')
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El tipo/dirección del movimiento no coincide con la transacción';
    END IF;
END$$

CREATE TRIGGER trg_account_movements_after_insert
AFTER INSERT ON account_movements
FOR EACH ROW
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET @ledger_balance_update = 0;
        RESIGNAL;
    END;
    SET @ledger_balance_update = 1;
    IF NEW.direction = 'CREDIT' THEN
        UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSE
        UPDATE accounts
           SET balance = balance - NEW.amount
         WHERE id = NEW.account_id AND balance >= NEW.amount;
        IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Fondos insuficientes: el saldo no puede ser negativo';
        END IF;
    END IF;
    SET @ledger_balance_update = 0;
    CALL sp_audit_write(
      'account_movements', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('transaction_id',NEW.transaction_id,'account_id',NEW.account_id,
                  'movement_type',NEW.movement_type,'direction',NEW.direction,'amount',NEW.amount),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_account_movements_no_update
BEFORE UPDATE ON account_movements
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El libro de movimientos es inmutable; registre un movimiento compensatorio';
END$$

CREATE TRIGGER trg_account_movements_no_delete
BEFORE DELETE ON account_movements
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar movimientos del libro contable';
END$$

CREATE TRIGGER trg_daily_snapshots_no_update
BEFORE UPDATE ON daily_balance_snapshots
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los saldos históricos de cierre son inmutables';
END$$

CREATE TRIGGER trg_daily_snapshots_no_delete
BEFORE DELETE ON daily_balance_snapshots
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar saldos históricos de cierre';
END$$

CREATE TRIGGER trg_interest_accruals_before_update
BEFORE UPDATE ON account_interest_accruals
FOR EACH ROW
BEGIN
    IF NEW.account_id <> OLD.account_id OR NEW.accrual_date <> OLD.accrual_date
       OR NEW.balance_basis <> OLD.balance_basis OR NEW.annual_rate <> OLD.annual_rate
       OR NEW.day_count_basis <> OLD.day_count_basis OR NEW.interest_amount <> OLD.interest_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El devengo diario es inmutable; solo puede cambiar su estado de contabilización';
    END IF;
    IF OLD.status = 'POSTED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Un devengo contabilizado no puede modificarse';
    END IF;
    IF NEW.status <> 'POSTED' OR NEW.credited_at IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Un devengo pendiente solo puede pasar a POSTED con fecha de contabilización';
    END IF;
END$$

CREATE TRIGGER trg_interest_accruals_no_delete
BEFORE DELETE ON account_interest_accruals
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar devengos; conserve la trazabilidad financiera';
END$$

CREATE TRIGGER trg_accounts_before_insert
BEFORE INSERT ON accounts
FOR EACH ROW
BEGIN
    DECLARE v_customer_status VARCHAR(12);
    DECLARE v_product_type VARCHAR(30);
    DECLARE v_product_active BOOLEAN;
    SELECT status INTO v_customer_status FROM customers WHERE id = NEW.customer_id;
    SELECT product_type, is_active INTO v_product_type, v_product_active
      FROM financial_products WHERE id = NEW.product_id;
    IF v_customer_status <> 'ACTIVE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se puede abrir cuenta a un socio activo';
    END IF;
    IF v_product_type <> 'DEPOSIT_ACCOUNT' OR v_product_active = FALSE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta debe usar un producto de depósito activo';
    END IF;
    IF NEW.balance <> 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta debe abrir con saldo cero; use un depósito para fondearla';
    END IF;
END$$

CREATE TRIGGER trg_accounts_before_update
BEFORE UPDATE ON accounts
FOR EACH ROW
BEGIN
    DECLARE v_product_type VARCHAR(30);
    IF NEW.balance <> OLD.balance AND COALESCE(@ledger_balance_update, 0) <> 1 THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'El saldo solo puede modificarse mediante el libro de movimientos';
    END IF;
    IF OLD.status = 'CLOSED' AND NEW.status <> 'CLOSED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una cuenta cerrada no puede reactivarse';
    END IF;
    IF NEW.status = 'CLOSED' THEN
        IF NEW.balance <> 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede cerrar una cuenta con saldo distinto de cero';
        END IF;
        SET NEW.closed_at = COALESCE(NEW.closed_at, CURRENT_TIMESTAMP);
    END IF;
    IF NEW.product_id <> OLD.product_id THEN
        SELECT product_type INTO v_product_type FROM financial_products WHERE id = NEW.product_id;
        IF v_product_type <> 'DEPOSIT_ACCOUNT' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Una cuenta no puede cambiar a un producto que no sea de depósito';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_accounts_no_delete
BEFORE DELETE ON accounts
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar cuentas; cierre o bloquee la cuenta para conservar el historial';
END$$

CREATE TRIGGER trg_accounts_after_insert
AFTER INSERT ON accounts
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'accounts', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('account_number',NEW.account_number,'customer_id',NEW.customer_id,
                  'product_id',NEW.product_id,'balance',NEW.balance,'status',NEW.status),
      NEW.created_by_user_id
    );
END$$

CREATE TRIGGER trg_accounts_after_update
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    IF OLD.balance <> NEW.balance OR OLD.status <> NEW.status OR NOT (OLD.closed_at <=> NEW.closed_at) THEN
        CALL sp_audit_write(
          'accounts', CAST(NEW.id AS CHAR), 'UPDATE',
          JSON_OBJECT('balance',OLD.balance,'status',OLD.status,'closed_at',OLD.closed_at),
          JSON_OBJECT('balance',NEW.balance,'status',NEW.status,'closed_at',NEW.closed_at),
          @app_user_id
        );
    END IF;
END$$

CREATE TRIGGER trg_customers_after_insert
AFTER INSERT ON customers
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'customers', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('customer_number',NEW.customer_number,'first_name',NEW.first_name,
                  'paternal_surname',NEW.paternal_surname,'rfc',NEW.rfc,
                  'curp',NEW.curp,'status',NEW.status),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_customers_after_update
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'customers', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('email',OLD.email,'phone',OLD.phone,'status',OLD.status,'rfc',OLD.rfc),
      JSON_OBJECT('email',NEW.email,'phone',NEW.phone,'status',NEW.status,'rfc',NEW.rfc),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_customer_documents_after_insert
AFTER INSERT ON customer_documents
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'customer_documents', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('customer_id',NEW.customer_id,'document_type',NEW.document_type,
                  'sha256_hash',NEW.sha256_hash,'encrypted',NEW.encrypted,'status',NEW.status),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_customer_documents_after_update
AFTER UPDATE ON customer_documents
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'customer_documents', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('status',OLD.status,'expires_on',OLD.expires_on),
      JSON_OBJECT('status',NEW.status,'expires_on',NEW.expires_on),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_loan_applications_after_insert
AFTER INSERT ON loan_applications
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'loan_applications', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('customer_id',NEW.customer_id,'product_id',NEW.product_id,
                  'requested_amount',NEW.requested_amount,'term_months',NEW.term_months,
                  'requires_supervisor_approval',NEW.requires_supervisor_approval,'status',NEW.status),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_loan_applications_after_update
AFTER UPDATE ON loan_applications
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'loan_applications', CAST(NEW.id AS CHAR), 'UPDATE',
      JSON_OBJECT('status',OLD.status,'decision_comment',OLD.decision_comment),
      JSON_OBJECT('status',NEW.status,'decision_comment',NEW.decision_comment),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_loans_before_update
BEFORE UPDATE ON loans
FOR EACH ROW
BEGIN
    IF NEW.principal_balance <> OLD.principal_balance AND COALESCE(@loan_balance_update, 0) <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El saldo de capital solo cambia mediante asignaciones de pago';
    END IF;
    IF NEW.loan_application_id <> OLD.loan_application_id
       OR NEW.contract_number <> OLD.contract_number
       OR NEW.disbursement_transaction_id <> OLD.disbursement_transaction_id
       OR NOT (NEW.deposit_account_id <=> OLD.deposit_account_id)
       OR NEW.principal_amount <> OLD.principal_amount
       OR NEW.annual_interest_rate <> OLD.annual_interest_rate
       OR NEW.term_months <> OLD.term_months
       OR NEW.start_date <> OLD.start_date OR NEW.maturity_date <> OLD.maturity_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los términos del contrato no se editan después del desembolso';
    END IF;
END$$

CREATE TRIGGER trg_loans_after_update
AFTER UPDATE ON loans
FOR EACH ROW
BEGIN
    IF OLD.principal_balance <> NEW.principal_balance OR OLD.status <> NEW.status THEN
        CALL sp_audit_write(
          'loans', CAST(NEW.id AS CHAR), 'UPDATE',
          JSON_OBJECT('principal_balance',OLD.principal_balance,'status',OLD.status),
          JSON_OBJECT('principal_balance',NEW.principal_balance,'status',NEW.status),
          @app_user_id
        );
    END IF;
END$$

CREATE TRIGGER trg_loan_installments_before_update
BEFORE UPDATE ON loan_installments
FOR EACH ROW
BEGIN
    IF (NEW.principal_paid <> OLD.principal_paid OR NEW.interest_paid <> OLD.interest_paid
        OR NEW.late_fee_paid <> OLD.late_fee_paid OR NEW.status <> OLD.status)
       AND COALESCE(@loan_payment_apply, 0) <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los importes pagados de una parcialidad solo cambian al aplicar un pago';
    END IF;
    IF (OLD.principal_paid > 0 OR OLD.interest_paid > 0 OR OLD.late_fee_paid > 0)
       AND (NEW.due_date <> OLD.due_date OR NEW.scheduled_principal <> OLD.scheduled_principal
            OR NEW.scheduled_interest <> OLD.scheduled_interest OR NEW.late_fee_due <> OLD.late_fee_due) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede modificar el calendario de una parcialidad que ya recibió pagos';
    END IF;
END$$

CREATE TRIGGER trg_loan_payments_before_insert
BEFORE INSERT ON loan_payments
FOR EACH ROW
BEGIN
    DECLARE v_type VARCHAR(35);
    DECLARE v_amount DECIMAL(18,2);
    DECLARE v_tx_customer BIGINT UNSIGNED;
    DECLARE v_loan_customer BIGINT UNSIGNED;
    DECLARE v_loan_status VARCHAR(20);
    SELECT t.transaction_type, t.amount, t.customer_id
      INTO v_type, v_amount, v_tx_customer
      FROM financial_transactions t WHERE t.id = NEW.transaction_id;
    SELECT la.customer_id, l.status INTO v_loan_customer, v_loan_status
      FROM loans l JOIN loan_applications la ON la.id = l.loan_application_id
     WHERE l.id = NEW.loan_id;
    IF v_type <> 'LOAN_PAYMENT' OR v_amount <> NEW.total_amount
       OR v_tx_customer <> v_loan_customer OR v_loan_status <> 'ACTIVE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pago, la transacción y el préstamo no coinciden o el préstamo no está activo';
    END IF;
END$$

CREATE TRIGGER trg_loan_payment_allocations_before_insert
BEFORE INSERT ON loan_payment_allocations
FOR EACH ROW
BEGIN
    DECLARE v_installment_loan BIGINT UNSIGNED;
    DECLARE v_scheduled_principal DECIMAL(18,2);
    DECLARE v_scheduled_interest DECIMAL(18,2);
    DECLARE v_late_fee_due DECIMAL(18,2);
    DECLARE v_principal_paid DECIMAL(18,2);
    DECLARE v_interest_paid DECIMAL(18,2);
    DECLARE v_late_fee_paid DECIMAL(18,2);
    DECLARE v_payment_loan BIGINT UNSIGNED;
    DECLARE v_principal_balance DECIMAL(18,2);
    SELECT loan_id INTO v_payment_loan FROM loan_payments WHERE id = NEW.loan_payment_id;
    SELECT loan_id, scheduled_principal, scheduled_interest, late_fee_due,
           principal_paid, interest_paid, late_fee_paid
      INTO v_installment_loan, v_scheduled_principal, v_scheduled_interest,
           v_late_fee_due, v_principal_paid, v_interest_paid, v_late_fee_paid
      FROM loan_installments WHERE id = NEW.installment_id FOR UPDATE;
    IF v_installment_loan <> v_payment_loan THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La parcialidad no pertenece al préstamo del pago';
    END IF;
    IF NEW.principal_amount > (v_scheduled_principal - v_principal_paid)
       OR NEW.interest_amount > (v_scheduled_interest - v_interest_paid)
       OR NEW.late_fee_amount > (v_late_fee_due - v_late_fee_paid) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La asignación excede el saldo pendiente de la parcialidad';
    END IF;
    SELECT principal_balance INTO v_principal_balance
      FROM loans WHERE id = v_payment_loan FOR UPDATE;
    IF NEW.principal_amount > v_principal_balance THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El capital aplicado excede el saldo del préstamo';
    END IF;
END$$

CREATE TRIGGER trg_loan_payment_allocations_after_insert
AFTER INSERT ON loan_payment_allocations
FOR EACH ROW
BEGIN
    DECLARE v_loan_id BIGINT UNSIGNED;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET @loan_balance_update = 0;
        SET @loan_payment_apply = 0;
        RESIGNAL;
    END;
    SET @loan_payment_apply = 1;
    UPDATE loan_installments
       SET status = CASE
             WHEN principal_paid + NEW.principal_amount >= scheduled_principal
              AND interest_paid + NEW.interest_amount >= scheduled_interest
              AND late_fee_paid + NEW.late_fee_amount >= late_fee_due THEN 'PAID'
             WHEN principal_paid + NEW.principal_amount > 0
               OR interest_paid + NEW.interest_amount > 0
               OR late_fee_paid + NEW.late_fee_amount > 0 THEN 'PARTIAL'
             ELSE 'OPEN' END,
           principal_paid = principal_paid + NEW.principal_amount,
           interest_paid = interest_paid + NEW.interest_amount,
           late_fee_paid = late_fee_paid + NEW.late_fee_amount
     WHERE id = NEW.installment_id;
    SET @loan_payment_apply = 0;
    SELECT loan_id INTO v_loan_id FROM loan_installments WHERE id = NEW.installment_id;
    IF NEW.principal_amount > 0 THEN
        SET @loan_balance_update = 1;
        UPDATE loans SET principal_balance = principal_balance - NEW.principal_amount
         WHERE id = v_loan_id AND principal_balance >= NEW.principal_amount;
        IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No fue posible actualizar el saldo de capital';
        END IF;
        SET @loan_balance_update = 0;
    END IF;
    UPDATE loans l
       SET l.status = 'PAID_OFF'
     WHERE l.id = v_loan_id AND l.principal_balance = 0
       AND NOT EXISTS (
          SELECT 1 FROM loan_installments i
           WHERE i.loan_id = l.id AND i.status <> 'PAID'
       );
    CALL sp_audit_write(
      'loan_payment_allocations', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('loan_payment_id',NEW.loan_payment_id,'installment_id',NEW.installment_id,
                  'principal_amount',NEW.principal_amount,'interest_amount',NEW.interest_amount,
                  'late_fee_amount',NEW.late_fee_amount),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_loan_payments_after_insert
AFTER INSERT ON loan_payments
FOR EACH ROW
BEGIN
    CALL sp_audit_write(
      'loan_payments', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('loan_id',NEW.loan_id,'transaction_id',NEW.transaction_id,
                  'total_amount',NEW.total_amount,'paid_at',NEW.paid_at),
      @app_user_id
    );
END$$

CREATE TRIGGER trg_loan_payments_no_update
BEFORE UPDATE ON loan_payments
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El registro de pago es inmutable';
END$$

CREATE TRIGGER trg_loan_payments_no_delete
BEFORE DELETE ON loan_payments
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar pagos de préstamos';
END$$

CREATE TRIGGER trg_loan_payment_allocations_no_update
BEFORE UPDATE ON loan_payment_allocations
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Las asignaciones de un pago son inmutables';
END$$

CREATE TRIGGER trg_loan_payment_allocations_no_delete
BEFORE DELETE ON loan_payment_allocations
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar asignaciones de pagos';
END$$

CREATE TRIGGER trg_loyalty_movements_after_insert
AFTER INSERT ON loyalty_movements
FOR EACH ROW
BEGIN
    IF NEW.points_delta < 0 THEN
        UPDATE loyalty_accounts
           SET points_balance = points_balance + NEW.points_delta
         WHERE customer_id = NEW.customer_id AND points_balance + NEW.points_delta >= 0
           AND status = 'ACTIVE';
        IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Puntos insuficientes o cuenta de lealtad inactiva';
        END IF;
    ELSE
        UPDATE loyalty_accounts
           SET points_balance = points_balance + NEW.points_delta
         WHERE customer_id = NEW.customer_id AND status = 'ACTIVE';
        IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El socio no tiene una cuenta de lealtad activa';
        END IF;
    END IF;
    CALL sp_audit_write(
      'loyalty_movements', CAST(NEW.id AS CHAR), 'INSERT', NULL,
      JSON_OBJECT('customer_id',NEW.customer_id,'points_delta',NEW.points_delta,
                  'movement_type',NEW.movement_type,'description',NEW.description),
      NEW.created_by_user_id
    );
END$$

CREATE TRIGGER trg_loyalty_movements_no_update
BEFORE UPDATE ON loyalty_movements
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El libro de puntos es inmutable; registre un ajuste compensatorio';
END$$

CREATE TRIGGER trg_loyalty_movements_no_delete
BEFORE DELETE ON loyalty_movements
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar movimientos de puntos';
END$$

CREATE TRIGGER trg_loyalty_redemptions_before_insert
BEFORE INSERT ON loyalty_redemptions
FOR EACH ROW
BEGIN
    DECLARE v_points_cost BIGINT UNSIGNED;
    DECLARE v_stock INT UNSIGNED;
    DECLARE v_active BOOLEAN;
    SELECT points_cost, stock_quantity, is_active
      INTO v_points_cost, v_stock, v_active
      FROM loyalty_catalog_items WHERE id = NEW.catalog_item_id FOR UPDATE;
    IF v_active = FALSE OR v_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Artículo inactivo o inventario insuficiente';
    END IF;
    IF NEW.points_redeemed <> v_points_cost * NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los puntos no coinciden con el costo actual del artículo';
    END IF;
    IF NEW.status NOT IN ('APPROVED','FULFILLED') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El canje debe registrarse aprobado para reservar puntos e inventario';
    END IF;
END$$

CREATE TRIGGER trg_loyalty_redemptions_after_insert
AFTER INSERT ON loyalty_redemptions
FOR EACH ROW
BEGIN
    UPDATE loyalty_catalog_items
       SET stock_quantity = stock_quantity - NEW.quantity
     WHERE id = NEW.catalog_item_id AND stock_quantity >= NEW.quantity;
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se pudo reservar el inventario para el canje';
    END IF;
    INSERT INTO loyalty_movements (
      customer_id, points_delta, movement_type, description, related_redemption_id, created_by_user_id
    ) VALUES (
      NEW.customer_id, -CAST(NEW.points_redeemed AS SIGNED), 'REDEEM',
      CONCAT('Canje de catálogo #', NEW.id), NEW.id, @app_user_id
    );
END$$

CREATE TRIGGER trg_loyalty_redemptions_before_update
BEFORE UPDATE ON loyalty_redemptions
FOR EACH ROW
BEGIN
    IF NEW.customer_id <> OLD.customer_id OR NEW.catalog_item_id <> OLD.catalog_item_id
       OR NEW.quantity <> OLD.quantity OR NEW.points_redeemed <> OLD.points_redeemed THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los datos de un canje contabilizado son inmutables';
    END IF;
    IF OLD.status = 'CANCELLED' AND NEW.status <> 'CANCELLED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Un canje cancelado no puede reactivarse';
    END IF;
    IF OLD.status = 'APPROVED' AND NEW.status = 'CANCELLED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Use movimientos compensatorios de puntos e inventario para cancelar un canje aprobado';
    END IF;
    IF OLD.status = 'FULFILLED' AND NEW.status <> 'FULFILLED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Un canje entregado no puede revertirse directamente';
    END IF;
END$$

CREATE TRIGGER trg_audit_logs_no_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La bitácora de auditoría es inmutable';
END$$

CREATE TRIGGER trg_audit_logs_no_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se permite borrar la bitácora de auditoría';
END$$

-- ---------------------------------------------------------------------------
-- 13. Procedimientos transaccionales
-- ---------------------------------------------------------------------------
CREATE PROCEDURE sp_create_account(
    IN p_customer_id BIGINT UNSIGNED,
    IN p_product_id BIGINT UNSIGNED,
    IN p_created_by_user_id BIGINT UNSIGNED,
    OUT p_account_id BIGINT UNSIGNED,
    OUT p_account_number VARCHAR(24)
)
BEGIN
    DECLARE v_next_number BIGINT UNSIGNED;
    DECLARE v_customer_status VARCHAR(12);
    DECLARE v_product_type VARCHAR(30);
    DECLARE EXIT HANDLER FOR NOT FOUND
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    START TRANSACTION;
    SELECT status INTO v_customer_status FROM customers WHERE id = p_customer_id FOR UPDATE;
    IF v_customer_status <> 'ACTIVE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El socio no está activo';
    END IF;
    SELECT product_type INTO v_product_type FROM financial_products
     WHERE id = p_product_id AND is_active = TRUE;
    IF v_product_type <> 'DEPOSIT_ACCOUNT' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El producto no es una cuenta de depósito activa';
    END IF;
    SELECT next_value INTO v_next_number FROM account_number_sequences
     WHERE sequence_name = 'ACCOUNT' FOR UPDATE;
    UPDATE account_number_sequences SET next_value = next_value + 1 WHERE sequence_name = 'ACCOUNT';
    SET p_account_number = CONCAT('CTA', DATE_FORMAT(CURRENT_DATE(), '%y'), LPAD(v_next_number, 10, '0'));
    INSERT INTO accounts (account_number, customer_id, product_id, balance, status, created_by_user_id)
    VALUES (p_account_number, p_customer_id, p_product_id, 0, 'ACTIVE', p_created_by_user_id);
    SET p_account_id = LAST_INSERT_ID();
    COMMIT;
END$$

CREATE PROCEDURE sp_record_account_movement(
    IN p_account_id BIGINT UNSIGNED,
    IN p_movement_type VARCHAR(30),
    IN p_direction VARCHAR(10),
    IN p_amount DECIMAL(18,2),
    IN p_user_id BIGINT UNSIGNED,
    IN p_cashier_session_id BIGINT UNSIGNED,
    IN p_channel VARCHAR(20),
    IN p_payment_method VARCHAR(20),
    IN p_notes VARCHAR(1000),
    OUT p_transaction_id BIGINT UNSIGNED,
    OUT p_receipt_number VARCHAR(50)
)
BEGIN
    DECLARE v_customer_id BIGINT UNSIGNED;
    DECLARE v_transaction_type VARCHAR(35);
    DECLARE EXIT HANDLER FOR NOT FOUND
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    IF p_amount IS NULL OR p_amount <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El importe debe ser mayor que cero';
    END IF;
    IF p_movement_type NOT IN ('DEPOSIT','WITHDRAWAL','ADJUSTMENT') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de movimiento no permitido en este procedimiento';
    END IF;
    START TRANSACTION;
    SELECT customer_id INTO v_customer_id FROM accounts
     WHERE id = p_account_id AND status = 'ACTIVE' FOR UPDATE;
    SET v_transaction_type = CASE p_movement_type
       WHEN 'DEPOSIT' THEN 'ACCOUNT_DEPOSIT'
       WHEN 'WITHDRAWAL' THEN 'ACCOUNT_WITHDRAWAL'
       ELSE 'OTHER' END;
    SET p_receipt_number = CONCAT('OP-', REPLACE(UUID(), '-', ''));
    INSERT INTO financial_transactions (
      receipt_number, customer_id, processed_by_user_id, cashier_session_id,
      transaction_type, channel, payment_method, amount, status, notes
    ) VALUES (
      p_receipt_number, v_customer_id, p_user_id, p_cashier_session_id,
      v_transaction_type, p_channel, p_payment_method, p_amount, 'PENDING', p_notes
    );
    SET p_transaction_id = LAST_INSERT_ID();
    INSERT INTO account_movements (transaction_id, account_id, movement_type, direction, amount)
    VALUES (p_transaction_id, p_account_id, p_movement_type, p_direction, p_amount);
    UPDATE financial_transactions SET status = 'POSTED' WHERE id = p_transaction_id;
    COMMIT;
END$$

-- Desembolsa una solicitud aprobada. Si se deposita en la cuenta del socio,
-- registra también el abono en el libro de movimientos.
CREATE PROCEDURE sp_record_loan_disbursement(
    IN p_loan_application_id BIGINT UNSIGNED,
    IN p_contract_number VARCHAR(40),
    IN p_principal_amount DECIMAL(18,2),
    IN p_annual_interest_rate DECIMAL(9,6),
    IN p_term_months SMALLINT UNSIGNED,
    IN p_start_date DATE,
    IN p_maturity_date DATE,
    IN p_payment_method VARCHAR(20),
    IN p_deposit_account_id BIGINT UNSIGNED,
    IN p_user_id BIGINT UNSIGNED,
    IN p_cashier_session_id BIGINT UNSIGNED,
    IN p_channel VARCHAR(20),
    IN p_notes VARCHAR(1000),
    OUT p_loan_id BIGINT UNSIGNED,
    OUT p_transaction_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_customer_id BIGINT UNSIGNED;
    DECLARE v_app_status VARCHAR(20);
    DECLARE v_requested_amount DECIMAL(18,2);
    DECLARE v_app_term SMALLINT UNSIGNED;
    DECLARE v_account_customer BIGINT UNSIGNED;
    DECLARE v_min_amount DECIMAL(18,2);
    DECLARE v_max_amount DECIMAL(18,2);
    DECLARE v_product_id BIGINT UNSIGNED;
    DECLARE v_receipt VARCHAR(50);
    DECLARE EXIT HANDLER FOR NOT FOUND
    BEGIN
        SET @loan_disbursement_complete = 0;
        ROLLBACK;
        RESIGNAL;
    END;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET @loan_disbursement_complete = 0;
        ROLLBACK;
        RESIGNAL;
    END;
    IF p_principal_amount IS NULL OR p_principal_amount <= 0
       OR p_annual_interest_rate IS NULL OR p_annual_interest_rate NOT BETWEEN 0 AND 1
       OR p_term_months = 0 OR p_maturity_date < p_start_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Parámetros del préstamo inválidos';
    END IF;
    START TRANSACTION;
    SELECT customer_id, status, requested_amount, term_months, product_id
      INTO v_customer_id, v_app_status, v_requested_amount, v_app_term, v_product_id
      FROM loan_applications WHERE id = p_loan_application_id FOR UPDATE;
    IF v_app_status <> 'APPROVED' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La solicitud debe estar aprobada antes del desembolso';
    END IF;
    IF p_principal_amount > v_requested_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El desembolso no puede exceder el monto solicitado sin modificar la solicitud';
    END IF;
    IF p_term_months <> v_app_term THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El plazo desembolsado debe coincidir con el plazo aprobado en la solicitud';
    END IF;
    SELECT minimum_amount, maximum_amount INTO v_min_amount, v_max_amount
      FROM financial_products WHERE id = v_product_id;
    IF (v_min_amount IS NOT NULL AND p_principal_amount < v_min_amount)
       OR (v_max_amount IS NOT NULL AND p_principal_amount > v_max_amount) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El monto no cumple los límites configurados para el producto';
    END IF;
    IF p_payment_method = 'ACCOUNT' THEN
        IF p_deposit_account_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El desembolso por cuenta requiere una cuenta de destino';
        END IF;
        SELECT customer_id INTO v_account_customer FROM accounts
         WHERE id = p_deposit_account_id AND status = 'ACTIVE' FOR UPDATE;
        IF v_account_customer <> v_customer_id THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta destino no pertenece al socio';
        END IF;
    ELSEIF p_deposit_account_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta destino solo se indica para un desembolso ACCOUNT';
    END IF;
    SET v_receipt = CONCAT('LD-', REPLACE(UUID(), '-', ''));
    INSERT INTO financial_transactions (
      receipt_number, customer_id, processed_by_user_id, cashier_session_id,
      transaction_type, channel, payment_method, amount, status, notes
    ) VALUES (
      v_receipt, v_customer_id, p_user_id, p_cashier_session_id,
      'LOAN_DISBURSEMENT', p_channel, p_payment_method, p_principal_amount, 'PENDING', p_notes
    );
    SET p_transaction_id = LAST_INSERT_ID();
    IF p_payment_method = 'ACCOUNT' THEN
        INSERT INTO account_movements (
          transaction_id, account_id, movement_type, direction, amount
        ) VALUES (
          p_transaction_id, p_deposit_account_id, 'LOAN_DISBURSEMENT', 'CREDIT', p_principal_amount
        );
    END IF;
    UPDATE financial_transactions SET status = 'POSTED' WHERE id = p_transaction_id;
    SET @loan_disbursement_complete = 1;
    INSERT INTO loans (
      loan_application_id, contract_number, disbursement_transaction_id,
      deposit_account_id, principal_amount, principal_balance,
      annual_interest_rate, term_months, start_date, maturity_date, status
    ) VALUES (
      p_loan_application_id, p_contract_number, p_transaction_id,
      p_deposit_account_id, p_principal_amount, p_principal_amount,
      p_annual_interest_rate, p_term_months, p_start_date, p_maturity_date, 'ACTIVE'
    );
    SET p_loan_id = LAST_INSERT_ID();
    SET @loan_disbursement_complete = 0;
    COMMIT;
END$$

-- Capturar al cierre diario. Las filas existentes no se sobrescriben, para
-- conservar el saldo histórico de una fecha previamente cerrada.
CREATE PROCEDURE sp_capture_daily_balance_snapshots(IN p_snapshot_date DATE)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    IF p_snapshot_date <> CURRENT_DATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Capture el saldo al cierre del día actual; no invente snapshots históricos con el saldo presente';
    END IF;
    IF EXISTS (SELECT 1 FROM daily_balance_snapshots WHERE snapshot_date = p_snapshot_date) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe una captura de saldos para esa fecha';
    END IF;
    START TRANSACTION;
    INSERT INTO daily_balance_snapshots (account_id, snapshot_date, closing_balance)
    SELECT id, p_snapshot_date, balance FROM accounts WHERE status = 'ACTIVE';
    COMMIT;
END$$

-- Devenga interés a partir del saldo de cierre guardado, sin escanear ni
-- bloquear las cuentas en uso por caja. Debe ejecutarse una vez por fecha.
CREATE PROCEDURE sp_accrue_daily_interest(IN p_accrual_date DATE)
BEGIN
    DECLARE v_done BOOLEAN DEFAULT FALSE;
    DECLARE v_account_id BIGINT UNSIGNED;
    DECLARE v_balance DECIMAL(18,2);
    DECLARE v_opened_at DATETIME;
    DECLARE v_rate DECIMAL(9,6);
    DECLARE v_day_basis SMALLINT UNSIGNED DEFAULT 0;
    DECLARE v_interest DECIMAL(18,8);
    DECLARE v_plan_id BIGINT UNSIGNED;
    DECLARE cur_accounts CURSOR FOR
      SELECT s.account_id, s.closing_balance, a.opened_at
        FROM daily_balance_snapshots s
        JOIN accounts a ON a.id = s.account_id
       WHERE s.snapshot_date = p_accrual_date
       ORDER BY s.account_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    START TRANSACTION;
    SET v_plan_id = COALESCE((
      SELECT id FROM interest_rate_plans
       WHERE status = 'ACTIVE' AND effective_from <= p_accrual_date
         AND (effective_until IS NULL OR effective_until >= p_accrual_date)
       LIMIT 1
    ), 0);
    IF v_plan_id = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay un plan de tasas activo para la fecha solicitada';
    END IF;
    SELECT day_count_basis INTO v_day_basis FROM interest_rate_plans WHERE id = v_plan_id;
    IF NOT EXISTS (SELECT 1 FROM daily_balance_snapshots WHERE snapshot_date = p_accrual_date) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Primero capture los saldos de cierre del día';
    END IF;
    OPEN cur_accounts;
    accrual_loop: LOOP
        FETCH cur_accounts INTO v_account_id, v_balance, v_opened_at;
        IF v_done THEN LEAVE accrual_loop; END IF;
        IF EXISTS (SELECT 1 FROM account_interest_accruals
                    WHERE account_id = v_account_id AND accrual_date = p_accrual_date) THEN
            ITERATE accrual_loop;
        END IF;
        SET v_rate = COALESCE((
          SELECT s.annual_rate
            FROM interest_segments s
           WHERE s.plan_id = v_plan_id
             AND ((s.criterion_type = 'BALANCE'
                   AND v_balance >= s.min_balance
                   AND (s.max_balance IS NULL OR v_balance < s.max_balance))
               OR (s.criterion_type = 'TENURE'
                   AND DATEDIFF(p_accrual_date, DATE(v_opened_at)) >= s.min_tenure_days
                   AND (s.max_tenure_days IS NULL
                        OR DATEDIFF(p_accrual_date, DATE(v_opened_at)) < s.max_tenure_days)))
           ORDER BY s.priority DESC, s.segment_number ASC
           LIMIT 1
        ), -1);
        IF v_rate < 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay segmento de tasa aplicable para una cuenta; revise los rangos configurados';
        END IF;
        SET v_interest = ROUND(v_balance * v_rate / v_day_basis, 8);
        INSERT INTO account_interest_accruals (
          account_id, accrual_date, balance_basis, annual_rate,
          day_count_basis, interest_amount, status
        ) VALUES (
          v_account_id, p_accrual_date, v_balance, v_rate,
          v_day_basis, v_interest, 'PENDING'
        );
    END LOOP;
    CLOSE cur_accounts;
    COMMIT;
END$$

-- Recibe p_month como el primer día del mes (ej. 2026-10-01). El importe
-- acreditado se redondea a centavos; los devengos diarios conservan 8 decimales.
CREATE PROCEDURE sp_post_monthly_interest(IN p_month DATE)
BEGIN
    DECLARE v_done BOOLEAN DEFAULT FALSE;
    DECLARE v_account_id BIGINT UNSIGNED;
    DECLARE v_customer_id BIGINT UNSIGNED;
    DECLARE v_month_amount DECIMAL(18,2);
    DECLARE v_transaction_id BIGINT UNSIGNED;
    DECLARE v_receipt VARCHAR(50);
    DECLARE cur_month_accounts CURSOR FOR
      SELECT a.id, a.customer_id, ROUND(SUM(i.interest_amount), 2)
        FROM accounts a
        JOIN account_interest_accruals i ON i.account_id = a.id
       WHERE i.accrual_date >= p_month
         AND i.accrual_date < DATE_ADD(p_month, INTERVAL 1 MONTH)
         AND i.status = 'PENDING'
       GROUP BY a.id, a.customer_id
       ORDER BY a.id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    IF DAY(p_month) <> 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'p_month debe ser el primer día del mes';
    END IF;
    IF LAST_DAY(p_month) > CURRENT_DATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede abonar el rendimiento de un mes que todavía no ha concluido';
    END IF;
    IF EXISTS (
        SELECT 1 FROM accounts a
         WHERE a.status = 'ACTIVE' AND DATE(a.opened_at) <= LAST_DAY(p_month)
           AND (SELECT COUNT(*) FROM account_interest_accruals i
                 WHERE i.account_id = a.id
                   AND i.accrual_date >= GREATEST(DATE(a.opened_at), p_month)
                   AND i.accrual_date <= LAST_DAY(p_month))
               <> DATEDIFF(LAST_DAY(p_month), GREATEST(DATE(a.opened_at), p_month)) + 1
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Faltan devengos diarios del mes; complete snapshots y devengos antes del abono';
    END IF;
    START TRANSACTION;
    OPEN cur_month_accounts;
    monthly_loop: LOOP
        FETCH cur_month_accounts INTO v_account_id, v_customer_id, v_month_amount;
        IF v_done THEN LEAVE monthly_loop; END IF;
        SET v_transaction_id = NULL;
        IF v_month_amount > 0 THEN
            SET v_receipt = CONCAT('INT-', v_account_id, '-', DATE_FORMAT(p_month, '%Y%m'));
            INSERT INTO financial_transactions (
              receipt_number, customer_id, processed_by_user_id, cashier_session_id,
              transaction_type, channel, payment_method, amount, status, notes
            ) VALUES (
              v_receipt, v_customer_id, @app_user_id, NULL,
              'INTEREST_CREDIT', 'SYSTEM', 'NONE', v_month_amount, 'PENDING',
              CONCAT('Abono de intereses del mes ', DATE_FORMAT(p_month, '%Y-%m'))
            );
            SET v_transaction_id = LAST_INSERT_ID();
            INSERT INTO account_movements (
              transaction_id, account_id, movement_type, direction, amount
            ) VALUES (
              v_transaction_id, v_account_id, 'INTEREST_CREDIT', 'CREDIT', v_month_amount
            );
            UPDATE financial_transactions SET status = 'POSTED' WHERE id = v_transaction_id;
        END IF;
        UPDATE account_interest_accruals
           SET status = 'POSTED', credited_transaction_id = v_transaction_id,
               credited_at = CURRENT_TIMESTAMP
         WHERE account_id = v_account_id
           AND accrual_date >= p_month
           AND accrual_date < DATE_ADD(p_month, INTERVAL 1 MONTH)
           AND status = 'PENDING';
    END LOOP;
    CLOSE cur_month_accounts;
    COMMIT;
END$$

-- Aplica un pago a una o varias parcialidades. p_allocations debe ser un arreglo
-- JSON como: [{"installment_id":1,"principal":500,"interest":30,"fee":0}].
-- La suma de asignaciones debe coincidir exactamente con el importe del pago.
CREATE PROCEDURE sp_apply_loan_payment(
    IN p_loan_id BIGINT UNSIGNED,
    IN p_user_id BIGINT UNSIGNED,
    IN p_cashier_session_id BIGINT UNSIGNED,
    IN p_channel VARCHAR(20),
    IN p_payment_method VARCHAR(20),
    IN p_source_account_id BIGINT UNSIGNED,
    IN p_allocations JSON,
    IN p_notes VARCHAR(1000),
    OUT p_transaction_id BIGINT UNSIGNED,
    OUT p_loan_payment_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_customer_id BIGINT UNSIGNED;
    DECLARE v_total DECIMAL(18,2) DEFAULT 0;
    DECLARE v_source_customer BIGINT UNSIGNED;
    DECLARE v_receipt VARCHAR(50);
    DECLARE EXIT HANDLER FOR NOT FOUND
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    IF p_allocations IS NULL OR JSON_TYPE(p_allocations) <> 'ARRAY' OR JSON_LENGTH(p_allocations) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Debe enviar al menos una asignación de pago';
    END IF;
    START TRANSACTION;
    SELECT la.customer_id INTO v_customer_id
      FROM loans l JOIN loan_applications la ON la.id = l.loan_application_id
     WHERE l.id = p_loan_id AND l.status = 'ACTIVE' FOR UPDATE;
    SELECT COALESCE(SUM(COALESCE(j.principal_amount,0) + COALESCE(j.interest_amount,0) + COALESCE(j.late_fee_amount,0)),0)
      INTO v_total
      FROM JSON_TABLE(p_allocations, '$[*]' COLUMNS (
        principal_amount DECIMAL(18,2) PATH '$.principal' DEFAULT '0' ON EMPTY,
        interest_amount DECIMAL(18,2) PATH '$.interest' DEFAULT '0' ON EMPTY,
        late_fee_amount DECIMAL(18,2) PATH '$.fee' DEFAULT '0' ON EMPTY
      )) AS j;
    IF v_total <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pago calculado debe ser mayor que cero';
    END IF;
    IF p_payment_method = 'ACCOUNT' THEN
        IF p_source_account_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pago desde saldo requiere indicar la cuenta de origen';
        END IF;
        SELECT customer_id INTO v_source_customer FROM accounts
         WHERE id = p_source_account_id AND status = 'ACTIVE' FOR UPDATE;
        IF v_source_customer <> v_customer_id THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cuenta de origen no pertenece al deudor';
        END IF;
    ELSEIF p_source_account_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se debe indicar cuenta de origen cuando el método es ACCOUNT';
    END IF;
    SET v_receipt = CONCAT('LP-', REPLACE(UUID(), '-', ''));
    INSERT INTO financial_transactions (
      receipt_number, customer_id, processed_by_user_id, cashier_session_id,
      transaction_type, channel, payment_method, amount, status, notes
    ) VALUES (
      v_receipt, v_customer_id, p_user_id, p_cashier_session_id,
      'LOAN_PAYMENT', p_channel, p_payment_method, v_total, 'PENDING', p_notes
    );
    SET p_transaction_id = LAST_INSERT_ID();
    INSERT INTO loan_payments (loan_id, transaction_id, total_amount)
    VALUES (p_loan_id, p_transaction_id, v_total);
    SET p_loan_payment_id = LAST_INSERT_ID();
    IF p_payment_method = 'ACCOUNT' THEN
        INSERT INTO account_movements (transaction_id, account_id, movement_type, direction, amount)
        VALUES (p_transaction_id, p_source_account_id, 'WITHDRAWAL', 'DEBIT', v_total);
    END IF;
    INSERT INTO loan_payment_allocations (
      loan_payment_id, installment_id, principal_amount, interest_amount, late_fee_amount
    )
    SELECT p_loan_payment_id, j.installment_id,
           COALESCE(j.principal_amount,0), COALESCE(j.interest_amount,0), COALESCE(j.late_fee_amount,0)
      FROM JSON_TABLE(p_allocations, '$[*]' COLUMNS (
        installment_id BIGINT UNSIGNED PATH '$.installment_id',
        principal_amount DECIMAL(18,2) PATH '$.principal' DEFAULT '0' ON EMPTY,
        interest_amount DECIMAL(18,2) PATH '$.interest' DEFAULT '0' ON EMPTY,
        late_fee_amount DECIMAL(18,2) PATH '$.fee' DEFAULT '0' ON EMPTY
      )) AS j;
    UPDATE financial_transactions SET status = 'POSTED' WHERE id = p_transaction_id;
    COMMIT;
END$$

-- Actualiza/crea expedientes de cobranza a partir de las reglas vigentes.
-- Si un préstamo vencido no coincide con ninguna regla, la transacción se aborta
-- en lugar de asignarle una clasificación inventada.
CREATE PROCEDURE sp_refresh_collection_cases(IN p_as_of_date DATE)
BEGIN
    DECLARE v_done BOOLEAN DEFAULT FALSE;
    DECLARE v_loan_id BIGINT UNSIGNED;
    DECLARE v_business_days INT UNSIGNED;
    DECLARE v_classification VARCHAR(20);
    DECLARE v_existing_classification VARCHAR(20);
    DECLARE cur_overdue CURSOR FOR
      SELECT overdue.loan_id,
             (SELECT COUNT(*) FROM business_calendar bc
               WHERE bc.calendar_date > overdue.oldest_due_date
                 AND bc.calendar_date <= p_as_of_date AND bc.is_business_day = TRUE) AS business_days
        FROM (
          SELECT i.loan_id, MIN(i.due_date) AS oldest_due_date
            FROM loan_installments i
           WHERE i.due_date < p_as_of_date AND i.status <> 'PAID'
           GROUP BY i.loan_id
        ) overdue
        JOIN loans l ON l.id = overdue.loan_id
       WHERE l.status IN ('ACTIVE','DEFAULTED')
       ORDER BY overdue.loan_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    IF p_as_of_date > CURRENT_DATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha de corte no puede estar en el futuro';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM business_calendar WHERE calendar_date = p_as_of_date) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cargue el calendario laboral para la fecha de corte';
    END IF;
    START TRANSACTION;
    OPEN cur_overdue;
    case_loop: LOOP
        FETCH cur_overdue INTO v_loan_id, v_business_days;
        IF v_done THEN LEAVE case_loop; END IF;
        SET v_classification = COALESCE((
          SELECT cr.classification FROM collection_rules cr
           WHERE cr.is_active = TRUE AND cr.effective_from <= p_as_of_date
             AND (cr.effective_until IS NULL OR cr.effective_until >= p_as_of_date)
             AND v_business_days >= cr.minimum_business_days_overdue
             AND (cr.maximum_business_days_overdue IS NULL
                  OR v_business_days <= cr.maximum_business_days_overdue)
           ORDER BY cr.minimum_business_days_overdue DESC, cr.id DESC
           LIMIT 1
        ), '');
        IF v_classification = '' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No hay regla de cobranza aplicable a una deuda vencida; configure collection_rules';
        END IF;
        SET v_existing_classification = COALESCE((
          SELECT classification FROM collection_cases WHERE loan_id = v_loan_id LIMIT 1
        ), '');
        IF v_existing_classification = 'SOLD' THEN
            ITERATE case_loop;
        END IF;
        IF v_existing_classification = '' THEN
            INSERT INTO collection_cases (loan_id, classification, business_days_overdue)
            VALUES (v_loan_id, v_classification, v_business_days);
        ELSE
            UPDATE collection_cases
               SET classification = v_classification,
                   business_days_overdue = v_business_days
             WHERE loan_id = v_loan_id;
        END IF;
    END LOOP;
    CLOSE cur_overdue;
    COMMIT;
END$$

CREATE PROCEDURE sp_generate_collection_report(
    IN p_period_end DATE,
    IN p_generated_by_user_id BIGINT UNSIGNED,
    OUT p_report_id BIGINT UNSIGNED
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    IF p_period_end > CURRENT_DATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La fecha de corte no puede estar en el futuro';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM business_calendar WHERE calendar_date = p_period_end) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cargue el calendario de días hábiles para la fecha de corte';
    END IF;
    START TRANSACTION;
    INSERT INTO collection_reports (period_end, generated_by_user_id)
    VALUES (p_period_end, p_generated_by_user_id);
    SET p_report_id = LAST_INSERT_ID();
    INSERT INTO collection_report_rows (
      report_id, loan_id, contract_number, customer_id, customer_name,
      oldest_unpaid_due_date, overdue_amount, overdue_installments,
      business_days_overdue, classification, sale_eligibility
    )
    SELECT p_report_id, l.id, l.contract_number, la.customer_id,
           CONCAT_WS(' ', c.first_name, c.middle_name, c.paternal_surname, c.maternal_surname),
           overdue.oldest_unpaid_due_date, overdue.overdue_amount, overdue.overdue_installments,
           (SELECT COUNT(*) FROM business_calendar bc
             WHERE bc.calendar_date > overdue.oldest_unpaid_due_date
               AND bc.calendar_date <= p_period_end AND bc.is_business_day = TRUE),
           cc.classification, cc.sale_eligibility
      FROM loans l
      JOIN loan_applications la ON la.id = l.loan_application_id
      JOIN customers c ON c.id = la.customer_id
      JOIN (
          SELECT i.loan_id, MIN(i.due_date) AS oldest_unpaid_due_date,
                 SUM((i.scheduled_principal - i.principal_paid)
                   + (i.scheduled_interest - i.interest_paid)
                   + (i.late_fee_due - i.late_fee_paid)) AS overdue_amount,
                 COUNT(*) AS overdue_installments
            FROM loan_installments i
           WHERE i.due_date < p_period_end AND i.status <> 'PAID'
           GROUP BY i.loan_id
      ) overdue ON overdue.loan_id = l.id
      LEFT JOIN collection_cases cc ON cc.loan_id = l.id
     WHERE l.status IN ('ACTIVE','DEFAULTED');
    UPDATE collection_reports
       SET row_count = (SELECT COUNT(*) FROM collection_report_rows WHERE report_id = p_report_id)
     WHERE id = p_report_id;
    COMMIT;
END$$

DELIMITER ;

-- ---------------------------------------------------------------------------
-- 14. Vistas para app, conciliación y reportes
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_customer_account_summary AS
SELECT c.id AS customer_id,
       c.customer_number,
       CONCAT_WS(' ', c.first_name, c.middle_name, c.paternal_surname, c.maternal_surname) AS customer_name,
       a.id AS account_id,
       a.account_number,
       p.name AS account_product,
       a.balance,
       a.status AS account_status,
       a.opened_at
  FROM customers c
  JOIN accounts a ON a.customer_id = c.id
  JOIN financial_products p ON p.id = a.product_id;

CREATE OR REPLACE VIEW vw_account_statement AS
SELECT m.account_id,
       a.account_number,
       t.id AS transaction_id,
       t.receipt_number,
       t.created_at,
       m.movement_type,
       CASE WHEN m.direction = 'CREDIT' THEN m.amount ELSE -m.amount END AS signed_amount,
       SUM(CASE WHEN m.direction = 'CREDIT' THEN m.amount ELSE -m.amount END)
         OVER (PARTITION BY m.account_id ORDER BY m.created_at, m.id ROWS UNBOUNDED PRECEDING) AS calculated_running_balance,
       t.status AS transaction_status
  FROM account_movements m
  JOIN accounts a ON a.id = m.account_id
  JOIN financial_transactions t ON t.id = m.transaction_id
 WHERE t.status = 'POSTED';

CREATE OR REPLACE VIEW vw_cash_session_reconciliation AS
SELECT s.id AS session_id,
       s.branch_id,
       s.cashier_user_id,
       s.status,
       s.opened_at,
       s.closed_at,
       s.opening_cash,
       COALESCE(t.net_cash_movements,0) AS net_cash_movements,
       s.opening_cash + COALESCE(t.net_cash_movements,0) AS expected_cash,
       s.counted_cash,
       CASE WHEN s.counted_cash IS NULL THEN NULL
            ELSE s.counted_cash - (s.opening_cash + COALESCE(t.net_cash_movements,0)) END AS cash_difference
  FROM cashier_sessions s
  LEFT JOIN (
       SELECT cashier_session_id,
              SUM(CASE
                    WHEN transaction_type IN ('ACCOUNT_DEPOSIT','LOAN_PAYMENT',
                         'INVESTMENT_CONTRIBUTION','INSURANCE_PAYMENT','PRODUCT_PAYMENT') THEN amount
                    WHEN transaction_type IN ('ACCOUNT_WITHDRAWAL','LOAN_DISBURSEMENT') THEN -amount
                    ELSE 0 END) AS net_cash_movements
         FROM financial_transactions
        WHERE status = 'POSTED' AND payment_method = 'CASH'
        GROUP BY cashier_session_id
  ) t ON t.cashier_session_id = s.id;

-- La vista cuenta días hábiles usando business_calendar. El calendario debe
-- cargarse con días laborables y festivos de todo el horizonte que se reporte.
CREATE OR REPLACE VIEW vw_overdue_portfolio AS
SELECT l.id AS loan_id,
       l.contract_number,
       la.customer_id,
       CONCAT_WS(' ', c.first_name, c.middle_name, c.paternal_surname, c.maternal_surname) AS customer_name,
       overdue.oldest_unpaid_due_date,
       overdue.overdue_amount,
       overdue.overdue_installments,
       (SELECT COUNT(*) FROM business_calendar bc
         WHERE bc.calendar_date > overdue.oldest_unpaid_due_date
           AND bc.calendar_date <= CURRENT_DATE() AND bc.is_business_day = TRUE) AS business_days_overdue,
       cc.classification AS collection_classification,
       cc.assigned_collector_user_id,
       cc.next_action_at
  FROM loans l
  JOIN loan_applications la ON la.id = l.loan_application_id
  JOIN customers c ON c.id = la.customer_id
  JOIN (
       SELECT i.loan_id,
              MIN(i.due_date) AS oldest_unpaid_due_date,
              SUM((i.scheduled_principal - i.principal_paid)
                + (i.scheduled_interest - i.interest_paid)
                + (i.late_fee_due - i.late_fee_paid)) AS overdue_amount,
              COUNT(*) AS overdue_installments
         FROM loan_installments i
        WHERE i.due_date < CURRENT_DATE() AND i.status <> 'PAID'
        GROUP BY i.loan_id
  ) overdue ON overdue.loan_id = l.id
  LEFT JOIN collection_cases cc ON cc.loan_id = l.id
 WHERE l.status IN ('ACTIVE','DEFAULTED');

-- Exportación lógica para el reporte mensual de cartera vencida. La aplicación
-- debe filtrar por fecha de corte y exportar a XLSX/CSV según se necesite.
CREATE OR REPLACE VIEW vw_overdue_portfolio_export AS
SELECT report.id AS report_id, report.period_end, report.generated_at, rr.loan_id,
       rr.contract_number, rr.customer_id, rr.customer_name,
       rr.oldest_unpaid_due_date, rr.overdue_amount, rr.overdue_installments,
       rr.business_days_overdue, rr.classification, rr.sale_eligibility
  FROM collection_reports report
  JOIN collection_report_rows rr ON rr.report_id = report.id;

DELIMITER $$
CREATE PROCEDURE sp_close_cashier_session(
    IN p_session_id BIGINT UNSIGNED,
    IN p_closed_by_user_id BIGINT UNSIGNED,
    IN p_counted_cash DECIMAL(18,2),
    OUT p_expected_cash DECIMAL(18,2),
    OUT p_cash_difference DECIMAL(18,2)
)
BEGIN
    DECLARE v_status VARCHAR(10);
    DECLARE EXIT HANDLER FOR NOT FOUND
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    IF p_counted_cash IS NULL OR p_counted_cash < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El efectivo contado debe ser mayor o igual a cero';
    END IF;
    START TRANSACTION;
    SELECT status INTO v_status FROM cashier_sessions WHERE id = p_session_id FOR UPDATE;
    IF v_status <> 'OPEN' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La sesión de caja no está abierta';
    END IF;
    SELECT expected_cash INTO p_expected_cash
      FROM vw_cash_session_reconciliation WHERE session_id = p_session_id;
    SET p_cash_difference = p_counted_cash - p_expected_cash;
    UPDATE cashier_sessions
       SET counted_cash = p_counted_cash,
           closed_by_user_id = p_closed_by_user_id,
           closed_at = CURRENT_TIMESTAMP,
           status = 'CLOSED'
     WHERE id = p_session_id AND status = 'OPEN';
    COMMIT;
END$$
DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- FIN DEL ESQUEMA
-- ---------------------------------------------------------------------------
-- Tareas de configuración antes de operar:
-- 1) Insertar sucursales y productos; el producto de cuenta debe usar
--    product_type='DEPOSIT_ACCOUNT'.
-- 2) Crear un plan de tasa en DRAFT, agregar entre 5 y 7 segmentos compatibles
--    con su criterio (BALANCE o TENURE) y cambiar el plan a ACTIVE.
-- 3) Cargar business_calendar para los períodos de cobranza que se reportarán.
-- 4) Definir collection_rules, turn_types, tasas de lealtad, reglas de mora y el
--    calendario de amortización con el negocio; el documento fuente no fija todos esos umbrales ni la fórmula completa del préstamo.
-- 5) La app debe hacer SET @app_user_id = <id autenticado> por conexión para
--    atribuir auditoría. Esta variable no sustituye autenticación/autorización.
-- 6) Flujo diario recomendado: cerrar caja -> sp_capture_daily_balance_snapshots
--    (fecha de cierre) -> sp_accrue_daily_interest (misma fecha). Al cierre del
--    mes, ejecutar sp_post_monthly_interest con el primer día del mes.
-- 7) Desembolsar solicitudes aprobadas mediante sp_record_loan_disbursement;
--    registrar pagos con sp_apply_loan_payment para asegurar asignaciones completas.
-- 8) Cargar business_calendar de forma continua, configurar collection_rules y
--    ejecutar sp_refresh_collection_cases(fecha_corte) antes de generar el reporte.
--    Ejecutar sp_generate_collection_report(fecha_corte, usuario, @report_id); exportar las
--    filas desde vw_overdue_portfolio_export filtrando report_id/period_end.
