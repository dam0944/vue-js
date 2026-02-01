-- ============================================================================
-- GUESTHOUSE PROPERTY MANAGEMENT SYSTEM
-- Version: 2.0 Production Ready
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- PROPERTIES
-- ============================================================================

CREATE TABLE properties (
  property_id INT PRIMARY KEY AUTO_INCREMENT,
  property_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'GH01, HTL02',
  property_name VARCHAR(150) NOT NULL,
  property_name_khmer VARCHAR(150),
  property_type ENUM('guesthouse','hotel','resort','hostel') DEFAULT 'guesthouse',

  address TEXT,
  city VARCHAR(100) DEFAULT 'Phnom Penh',
  province VARCHAR(100),
  country VARCHAR(50) DEFAULT 'Cambodia',
  postal_code VARCHAR(20),
  
  phone VARCHAR(20),
  phone_secondary VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),

  -- Default operational settings
  default_currency ENUM('USD','KHR') DEFAULT 'USD',
  default_tax_rate DECIMAL(5,2) DEFAULT 0.00,
  default_check_in_time TIME DEFAULT '14:00:00',
  default_check_out_time TIME DEFAULT '12:00:00',
  timezone VARCHAR(50) DEFAULT 'Asia/Phnom_Penh',

  total_rooms INT DEFAULT 0,
  total_floors INT DEFAULT 1,

  is_active BOOLEAN DEFAULT TRUE,
  logo_url VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_active (is_active),
  INDEX idx_code (property_code),
  INDEX idx_city (city)

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NULL COMMENT 'NULL = access all properties',
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  profile_image VARCHAR(255),
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  employee_id VARCHAR(50) UNIQUE,
  position ENUM('owner','manager','receptionist','housekeeping','accountant','maintenance') NOT NULL,
  
  -- Security enhancements
  failed_login_attempts INT DEFAULT 0,
  last_failed_login TIMESTAMP NULL,
  account_locked_until TIMESTAMP NULL,
  password_changed_at TIMESTAMP NULL,
  must_change_password BOOLEAN DEFAULT FALSE,
  
  last_login TIMESTAMP NULL,
  last_login_ip VARCHAR(45),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_position (position),
  INDEX idx_property (property_id),
  INDEX idx_deleted (deleted_at)

CREATE TABLE system_config (
  config_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NULL COMMENT 'NULL = global config',
  config_key VARCHAR(100) NOT NULL,
  config_value TEXT,
  config_type ENUM('string','number','boolean','json') NOT NULL,
  category VARCHAR(50),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_by INT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL,

  UNIQUE KEY unique_property_key (property_id, config_key),
  INDEX idx_category (category),
  INDEX idx_key (config_key)

CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)

CREATE TABLE user_roles (
  user_role_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_role (user_id, role_id),
  INDEX idx_user (user_id),
  INDEX idx_role (role_id)

CREATE TABLE user_sessions (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_active (is_active),
  INDEX idx_token (session_token),
  INDEX idx_expires (expires_at)

CREATE TABLE permissions (
  permission_id INT PRIMARY KEY AUTO_INCREMENT,
  permission_code VARCHAR(100) UNIQUE NOT NULL,
  permission_name VARCHAR(150) NOT NULL,
  module VARCHAR(50) COMMENT 'bookings, invoices, reports, settings',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_module (module)

CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)

CREATE TABLE user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  permission_id INT NOT NULL,
  is_allowed BOOLEAN DEFAULT TRUE,
  granted_by INT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(user_id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_permission (user_id, permission_id)

-- ============================================================================
-- GUESTS
-- ============================================================================
CREATE TABLE guests (
  guest_id INT PRIMARY KEY AUTO_INCREMENT,
  guest_number VARCHAR(20) UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  full_name_khmer VARCHAR(150),
  email VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  nationality VARCHAR(50) DEFAULT 'Cambodian',
  id_type ENUM('passport','national_id','driving_license','other') DEFAULT 'national_id',
  id_number VARCHAR(50),
  date_of_birth DATE,
  gender ENUM('male','female','other'),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(50),
  
  -- Loyalty program
  vip_status BOOLEAN DEFAULT FALSE,
  loyalty_tier ENUM('none','bronze','silver','gold','platinum') DEFAULT 'none',
  total_stays INT DEFAULT 0,
  total_nights INT DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  
  -- Privacy & compliance
  marketing_consent BOOLEAN DEFAULT FALSE,
  data_retention_until DATE COMMENT 'GDPR compliance',
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  INDEX idx_phone (phone),
  INDEX idx_name (last_name, first_name),
  INDEX idx_guest_number (guest_number),
  INDEX idx_email (email),
  INDEX idx_deleted (deleted_at),
  INDEX idx_vip (vip_status)

CREATE TABLE guest_documents (
  document_id INT PRIMARY KEY AUTO_INCREMENT,
  guest_id INT NOT NULL,
  document_type ENUM('id_card','passport','visa','driving_license','other') NOT NULL,
  document_number VARCHAR(100),
  document_file_path VARCHAR(500),
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by INT NULL,
  verified_at TIMESTAMP NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT,
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_guest (guest_id),
  INDEX idx_expiry (expiry_date)

CREATE TABLE guest_preferences (
  preference_id INT PRIMARY KEY AUTO_INCREMENT,
  guest_id INT NOT NULL,
  preference_type ENUM('room_location','bed_type','smoking','floor','view','other') NOT NULL,
  preference_value VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE,
  INDEX idx_guest (guest_id)

-- ============================================================================
-- ROOM TYPES & ROOMS
-- ============================================================================
CREATE TABLE room_types (
  room_type_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,

  room_class ENUM('economy','standard','deluxe','suite','penthouse') NOT NULL DEFAULT 'standard',
  bed_count TINYINT NOT NULL DEFAULT 1,
  bed_type ENUM('single','double','queen','king','twin') DEFAULT 'double',

  type_code VARCHAR(20) NOT NULL COMMENT 'STD-DBL, DLX-KNG',
  type_name VARCHAR(50) NOT NULL,
  type_name_khmer VARCHAR(100),

  -- Pricing
  base_currency ENUM('USD','KHR') DEFAULT 'USD',
  nightly_price DECIMAL(12,2) NOT NULL,
  hourly_price DECIMAL(12,2) NULL,
  monthly_price DECIMAL(12,2) NULL,
  weekend_price DECIMAL(12,2) NULL COMMENT 'Fri-Sun pricing',
  
  max_occupancy INT NOT NULL DEFAULT 2,
  max_adults INT NOT NULL DEFAULT 2,
  max_children INT NOT NULL DEFAULT 1,
  
  size_sqm DECIMAL(6,2) COMMENT 'Room size',
  
  description TEXT,
  amenities JSON NULL COMMENT '["WiFi","AC","Hot Water","TV"]',

  status ENUM('active','inactive') DEFAULT 'active',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  UNIQUE KEY uniq_property_typecode (property_id, type_code),

  INDEX idx_property (property_id),
  INDEX idx_class (room_class),
  INDEX idx_status (status)

CREATE TABLE room_type_pricing_seasons (
  season_id INT PRIMARY KEY AUTO_INCREMENT,
  room_type_id INT NOT NULL,
  season_name VARCHAR(100) NOT NULL COMMENT 'Christmas, Water Festival',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00 COMMENT '1.5 = 50% increase',
  fixed_price DECIMAL(12,2) NULL COMMENT 'Or absolute price',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id) ON DELETE CASCADE,
  INDEX idx_room_type (room_type_id),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_active (is_active),
  
  CONSTRAINT chk_season_dates CHECK (end_date >= start_date)

CREATE TABLE rooms (
  room_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  room_type_id INT NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  building VARCHAR(50),

  status ENUM('available','occupied','cleaning','maintenance','out_of_order','blocked') DEFAULT 'available',
  
  -- Status tracking
  status_changed_at TIMESTAMP NULL,
  status_changed_by INT NULL,
  blocked_until DATE NULL,
  blocking_reason TEXT,
  
  last_cleaned_at TIMESTAMP NULL,
  last_cleaned_by INT NULL,
  
  last_maintenance_at TIMESTAMP NULL,
  next_maintenance_due DATE NULL,
  
  -- Optimistic locking
  version INT DEFAULT 0 COMMENT 'Prevents double booking',
  
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id),
  FOREIGN KEY (status_changed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (last_cleaned_by) REFERENCES users(user_id) ON DELETE SET NULL,

  UNIQUE KEY unique_property_room (property_id, room_number),
  INDEX idx_property (property_id),
  INDEX idx_status (status),
  INDEX idx_type (room_type_id),
  INDEX idx_floor (floor),
  INDEX idx_version (version)

CREATE TABLE room_images (
  image_id INT PRIMARY KEY AUTO_INCREMENT,

  room_id INT NULL,
  room_type_id INT NULL,

  image_url VARCHAR(500) NOT NULL,
  image_title VARCHAR(150),
  image_description TEXT,

  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT NULL,

  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,

  INDEX idx_room (room_id),
  INDEX idx_room_type (room_type_id),
  INDEX idx_primary (is_primary),
  INDEX idx_order (display_order),
  INDEX idx_active (is_active),

  CHECK (
    (room_id IS NOT NULL AND room_type_id IS NULL) OR
    (room_id IS NULL AND room_type_id IS NOT NULL)
  )

-- ============================================================================
-- BOOKINGS & RESERVATIONS
-- ============================================================================

CREATE TABLE bookings (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  booking_number VARCHAR(50) UNIQUE NOT NULL,

  primary_guest_id INT NOT NULL,
  booking_source ENUM('walk_in','phone','email','online','other') NOT NULL DEFAULT 'walk_in',
  
  -- OTA integration
  external_booking_id VARCHAR(100),
  channel_commission_rate DECIMAL(5,2),

  status ENUM('pending','confirmed','checked_in','checked_out','cancelled','no_show') DEFAULT 'pending',
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  deposit_amount DECIMAL(12,2) DEFAULT 0,
  deposit_paid DECIMAL(12,2) DEFAULT 0,
  deposit_currency ENUM('USD','KHR') DEFAULT 'USD',

  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP NULL,
  cancelled_by INT NULL,
  
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (primary_guest_id) REFERENCES guests(guest_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (cancelled_by) REFERENCES users(user_id) ON DELETE SET NULL,

  INDEX idx_property (property_id),
  INDEX idx_status (status),
  INDEX idx_date (booking_date),
  INDEX idx_guest (primary_guest_id),
  INDEX idx_booking_number (booking_number),
  INDEX idx_source (booking_source)

CREATE TABLE reservations (
  reservation_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  reservation_number VARCHAR(50) UNIQUE NOT NULL,

  booking_id INT NOT NULL,
  guest_id INT NOT NULL,
  room_id INT NOT NULL,
  room_type_id INT NOT NULL,

  booking_type ENUM('hourly','nightly','monthly') NOT NULL DEFAULT 'nightly',
  check_in_at DATETIME NOT NULL,
  check_out_at DATETIME NOT NULL,
  actual_check_in_at DATETIME NULL,
  actual_check_out_at DATETIME NULL,
  
  stay_units INT NOT NULL,

  adults INT NOT NULL DEFAULT 1,
  children INT DEFAULT 0,

  rate_per_unit DECIMAL(12,2) NOT NULL,
  currency ENUM('USD','KHR') DEFAULT 'USD',
  exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
  
  total_room_charge DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_reason VARCHAR(255),

  status ENUM('pending','confirmed','checked_in','checked_out','cancelled','no_show') DEFAULT 'pending',
  
  special_requests TEXT,
  notes TEXT,

  checked_in_by INT NULL,
  checked_out_by INT NULL,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id),
  FOREIGN KEY (room_id) REFERENCES rooms(room_id),
  FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id),
  FOREIGN KEY (checked_in_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (checked_out_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,

  INDEX idx_property (property_id),
  INDEX idx_booking (booking_id),
  INDEX idx_room (room_id),
  INDEX idx_status (status),
  INDEX idx_checkinout (check_in_at, check_out_at),
  INDEX idx_guest (guest_id),
  INDEX idx_reservation_number (reservation_number),
  INDEX idx_availability (property_id, room_id, status, check_in_at, check_out_at),
  
  CONSTRAINT chk_valid_dates CHECK (check_out_at > check_in_at),
  CONSTRAINT chk_valid_actual_dates CHECK (
    actual_check_out_at IS NULL OR 
    actual_check_in_at IS NULL OR 
    actual_check_out_at >= actual_check_in_at
  )

CREATE TABLE reservation_guests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reservation_id INT NOT NULL,
  guest_id INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  relationship VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE,

  -- FIX: prevent duplicates
  UNIQUE KEY uniq_res_guest (reservation_id, guest_id),

  INDEX idx_reservation (reservation_id),
  INDEX idx_guest (guest_id)

-- ============================================================================
-- CHARGES & BILLING
-- ============================================================================
CREATE TABLE additional_charges (
  charge_id INT PRIMARY KEY AUTO_INCREMENT,
  reservation_id INT NOT NULL,
  charge_type ENUM('late_checkout','early_checkin','extra_bed','damage','lost_key','cleaning_fee','minibar','laundry','room_service','other') NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  quantity INT DEFAULT 1,
  total_amount DECIMAL(12,2) NOT NULL,
  currency ENUM('USD','KHR') DEFAULT 'USD',
  
  charged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  charged_by INT NULL,
  
  -- Approval workflow
  requires_approval BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  approved_by INT NULL,
  approved_at TIMESTAMP NULL,
  
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  FOREIGN KEY (charged_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_reservation (reservation_id),
  INDEX idx_type (charge_type),
  INDEX idx_charged_at (charged_at)

CREATE TABLE invoices (
  invoice_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  booking_id INT NOT NULL,
  reservation_id INT NULL COMMENT 'Can link to specific reservation or entire booking',
  
  subtotal DECIMAL(12,2) NOT NULL COMMENT 'Room charges + additional charges',
  tax_rate DECIMAL(5,2) DEFAULT 0 COMMENT 'Tax percentage',
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_reason VARCHAR(255),
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,

  -- always correct balance (generated)
  balance_due DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  
  currency ENUM('USD','KHR') DEFAULT 'USD',
  
  status ENUM('draft','pending','paid','partially_paid','cancelled','refunded') DEFAULT 'draft',
  
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  paid_at TIMESTAMP NULL,
  
  notes TEXT,
  created_by INT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_status (status),
  INDEX idx_booking (booking_id),
  INDEX idx_number (invoice_number),
  INDEX idx_date (issued_at),
  INDEX idx_property (property_id)

CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  invoice_id INT NOT NULL,
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cash','credit_card','debit_card','bank_transfer','aba','wing','true_money','pi_pay','other') NOT NULL,
  payment_currency ENUM('USD','KHR') DEFAULT 'USD',
  exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
  amount_in_base_currency DECIMAL(12,2),
  
  reference_number VARCHAR(100),
  card_type VARCHAR(50),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  status ENUM('pending','completed','failed','refunded','cancelled') DEFAULT 'completed',
  notes TEXT,
  
  processed_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_invoice (invoice_id),
  INDEX idx_method (payment_method),
  INDEX idx_date (payment_date),
  INDEX idx_status (status),
  INDEX idx_number (payment_number),
  INDEX idx_property (property_id)

CREATE TABLE payment_refunds (
  refund_id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  invoice_id INT NOT NULL,
  refund_number VARCHAR(50) UNIQUE NOT NULL,
  
  refund_amount DECIMAL(12,2) NOT NULL,
  refund_method ENUM('cash','credit_card','bank_transfer','original_method') NOT NULL DEFAULT 'original_method',
  refund_reason TEXT,
  
  refund_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_by INT NULL,
  approved_by INT NULL,
  
  status ENUM('pending','approved','completed','rejected') DEFAULT 'pending',
  notes TEXT,
  
  FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_payment (payment_id),
  INDEX idx_date (refund_date),
  INDEX idx_status (status)
-- ============================================================================
-- CONTINUATION FROM invoice_items
-- ============================================================================

CREATE TABLE invoice_items (
  item_id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  reservation_id INT NULL,
  additional_charge_id INT NULL,
  
  item_type ENUM('room_charge','additional_charge','discount','tax','other') NOT NULL,
  description VARCHAR(255) NOT NULL,
  
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE SET NULL,
  FOREIGN KEY (additional_charge_id) REFERENCES additional_charges(charge_id) ON DELETE SET NULL,
  
  INDEX idx_invoice (invoice_id),
  INDEX idx_reservation (reservation_id),
  INDEX idx_type (item_type)

CREATE TABLE receipts (
  receipt_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_id INT NOT NULL,
  invoice_id INT NOT NULL,
  
  receipt_type ENUM('payment','refund','deposit') NOT NULL DEFAULT 'payment',
  amount DECIMAL(12,2) NOT NULL,
  currency ENUM('USD','KHR') DEFAULT 'USD',
  
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  issued_by INT NULL,
  printed_at TIMESTAMP NULL,
  print_count INT DEFAULT 0,
  
  notes TEXT,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
  FOREIGN KEY (issued_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_payment (payment_id),
  INDEX idx_number (receipt_number),
  INDEX idx_date (issued_at),
  INDEX idx_property (property_id)

-- ============================================================================
-- DAILY CLOSING & CASH DRAWER
-- ============================================================================

CREATE TABLE daily_closings (
  closing_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  closing_number VARCHAR(50) UNIQUE NOT NULL,
  
  business_date DATE NOT NULL,
  shift_type ENUM('morning','afternoon','evening','full_day') DEFAULT 'full_day',
  
  opening_cash DECIMAL(12,2) DEFAULT 0,
  closing_cash DECIMAL(12,2) NOT NULL,
  expected_cash DECIMAL(12,2) NOT NULL,
  cash_difference DECIMAL(12,2) DEFAULT 0 COMMENT 'closing_cash - expected_cash',
  
  total_cash_sales DECIMAL(12,2) DEFAULT 0,
  total_card_sales DECIMAL(12,2) DEFAULT 0,
  total_bank_transfers DECIMAL(12,2) DEFAULT 0,
  total_mobile_payments DECIMAL(12,2) DEFAULT 0 COMMENT 'ABA, Wing, etc',
  total_other_sales DECIMAL(12,2) DEFAULT 0,
  total_sales DECIMAL(12,2) NOT NULL,
  
  total_refunds DECIMAL(12,2) DEFAULT 0,
  
  opened_at TIMESTAMP NULL,
  closed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_by INT NULL,
  closed_by INT NOT NULL,
  
  status ENUM('open','closed','reconciled') DEFAULT 'closed',
  notes TEXT,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (opened_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (closed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  UNIQUE KEY unique_property_date_shift (property_id, business_date, shift_type),
  INDEX idx_date (business_date),
  INDEX idx_status (status),
  INDEX idx_property (property_id)

-- ============================================================================
-- ROOM KEYS
-- ============================================================================

CREATE TABLE room_keys (
  key_id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  key_number VARCHAR(20) NOT NULL,
  key_type ENUM('physical','card','code','digital') DEFAULT 'physical',
  status ENUM('available','issued','lost','damaged') DEFAULT 'available',
  issued_to_reservation_id INT NULL,
  issued_at TIMESTAMP NULL,
  returned_at TIMESTAMP NULL,
  replacement_cost DECIMAL(12,2) DEFAULT 5.00,
  notes TEXT,

  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (issued_to_reservation_id) REFERENCES reservations(reservation_id) ON DELETE SET NULL,

  UNIQUE KEY unique_room_key (room_id, key_number),
  INDEX idx_status (status),
  INDEX idx_reservation (issued_to_reservation_id),
  INDEX idx_room (room_id)

-- ============================================================================
-- HOUSEKEEPING
-- ============================================================================

CREATE TABLE housekeeping_tasks (
  task_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  room_id INT NOT NULL,
  
  task_type ENUM('cleaning','maintenance','inspection','deep_clean','turndown') NOT NULL DEFAULT 'cleaning',
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  
  status ENUM('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  
  assigned_to INT NULL,
  assigned_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  notes TEXT,
  completion_notes TEXT,
  issues_found TEXT COMMENT 'Damage, missing items, etc',
  
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_room (room_id),
  INDEX idx_status (status),
  INDEX idx_assigned (assigned_to),
  INDEX idx_date (created_at),
  INDEX idx_priority (priority),
  INDEX idx_property (property_id)

-- ============================================================================
-- TAX CONFIGURATION
-- ============================================================================

CREATE TABLE tax_rates (
  tax_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  tax_name VARCHAR(100) NOT NULL COMMENT 'VAT, Service Tax, Tourism Tax',
  tax_rate DECIMAL(5,2) NOT NULL,
  is_inclusive BOOLEAN DEFAULT FALSE COMMENT 'Included in price or added on top',
  applies_to ENUM('room','service','all') DEFAULT 'all',
  is_active BOOLEAN DEFAULT TRUE,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  INDEX idx_property (property_id),
  INDEX idx_active (is_active),
  INDEX idx_dates (effective_from, effective_to)

-- ============================================================================
-- PROMO CODES & DISCOUNTS
-- ============================================================================

CREATE TABLE promo_codes (
  promo_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NULL COMMENT 'NULL = all properties',
  promo_code VARCHAR(50) UNIQUE NOT NULL,
  promo_name VARCHAR(150) NOT NULL,
  description TEXT,
  
  discount_type ENUM('percentage','fixed_amount','free_night') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL COMMENT 'Percentage (15.00) or amount (50.00)',
  
  min_nights INT DEFAULT 1,
  min_booking_amount DECIMAL(12,2) DEFAULT 0,
  
  max_uses INT NULL COMMENT 'NULL = unlimited',
  max_uses_per_guest INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  
  applicable_room_types JSON NULL COMMENT '[1,2,3] room_type_ids',
  applicable_days_of_week JSON NULL COMMENT '[1,2,3,4,5] Mon-Fri only',
  blackout_dates JSON NULL COMMENT '["2026-12-25","2026-12-26"]',
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_code (promo_code),
  INDEX idx_active (is_active),
  INDEX idx_dates (valid_from, valid_to),
  INDEX idx_property (property_id),
  
  CONSTRAINT chk_promo_dates CHECK (valid_to >= valid_from)

CREATE TABLE promo_code_uses (
  use_id INT PRIMARY KEY AUTO_INCREMENT,
  promo_id INT NOT NULL,
  booking_id INT NOT NULL,
  guest_id INT NOT NULL,
  discount_applied DECIMAL(12,2) NOT NULL,
  original_amount DECIMAL(12,2) NOT NULL,
  final_amount DECIMAL(12,2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (promo_id) REFERENCES promo_codes(promo_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE,
  
  INDEX idx_promo (promo_id),
  INDEX idx_booking (booking_id),
  INDEX idx_guest (guest_id),
  INDEX idx_used_at (used_at)

-- ============================================================================
-- CANCELLATION POLICIES
-- ============================================================================

CREATE TABLE cancellation_policies (
  policy_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  policy_name VARCHAR(150) NOT NULL,
  
  hours_before_checkin INT NOT NULL COMMENT 'Cancel X hours before check-in',
  cancellation_fee_type ENUM('percentage','fixed_amount','nights') NOT NULL,
  cancellation_fee_value DECIMAL(12,2) NOT NULL,
  
  description TEXT,
  terms_and_conditions TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  INDEX idx_property (property_id),
  INDEX idx_active (is_active),
  INDEX idx_default (is_default)

-- Add cancellation policy to bookings
ALTER TABLE bookings 
ADD COLUMN cancellation_policy_id INT NULL AFTER booking_source,
ADD FOREIGN KEY (cancellation_policy_id) REFERENCES cancellation_policies(policy_id) ON DELETE SET NULL,
ADD INDEX idx_cancellation_policy (cancellation_policy_id);

-- ============================================================================
-- NOTIFICATION LOGS
-- ============================================================================

CREATE TABLE notification_logs (
  log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NULL,
  
  recipient_type ENUM('guest','user','admin','system') NOT NULL,
  recipient_id INT NOT NULL COMMENT 'guest_id or user_id',
  recipient_email VARCHAR(100),
  recipient_phone VARCHAR(20),
  
  notification_type ENUM(
    'booking_confirmation','check_in_reminder','check_out_reminder',
    'payment_receipt','payment_reminder','cancellation_confirmation',
    'promotional','system_alert','other'
  ) NOT NULL,
  
  delivery_method ENUM('email','sms','push','in_app') NOT NULL DEFAULT 'email',
  
  subject VARCHAR(255),
  message TEXT,
  
  related_booking_id INT NULL,
  related_invoice_id INT NULL,
  
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending','sent','delivered','failed','bounced') DEFAULT 'pending',
  error_message TEXT,
  
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP NULL,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
  FOREIGN KEY (related_booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
  FOREIGN KEY (related_invoice_id) REFERENCES invoices(invoice_id) ON DELETE SET NULL,
  
  INDEX idx_recipient (recipient_type, recipient_id),
  INDEX idx_sent_at (sent_at),
  INDEX idx_status (status),
  INDEX idx_type (notification_type),
  INDEX idx_property (property_id)

-- ============================================================================
-- ROOM AVAILABILITY CACHE (Performance Optimization)
-- ============================================================================

CREATE TABLE room_availability_cache (
  cache_id BIGINT PRIMARY KEY AUTO_INCREMENT,

  -- add property_id (multi-property safe)
  property_id INT NOT NULL,

  room_id INT NOT NULL,
  availability_date DATE NOT NULL,
  
  is_available BOOLEAN NOT NULL,
  status ENUM('available','occupied','blocked','maintenance') NOT NULL,
  
  rate DECIMAL(12,2) NULL COMMENT 'Dynamic rate for this date',
  reservation_id INT NULL COMMENT 'If occupied, which reservation',
  
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE SET NULL,
  
  -- unique must include property_id
  UNIQUE KEY unique_property_room_date (property_id, room_id, availability_date),

  INDEX idx_property_date (property_id, availability_date),
  INDEX idx_date (availability_date),
  INDEX idx_available (is_available),
  INDEX idx_room_status (room_id, status, availability_date)
);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
  log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NULL,
  user_id INT NULL,
  
  action_type VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc',
  table_name VARCHAR(100),
  record_id INT,
  
  old_values JSON COMMENT 'Previous state of record',
  new_values JSON COMMENT 'New state of record',
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_property (property_id),
  INDEX idx_user (user_id),
  INDEX idx_action (action_type),
  INDEX idx_table (table_name),
  INDEX idx_date (created_at),
  INDEX idx_record (table_name, record_id)
);


-- ============================================================================
-- USEFUL TRIGGERS
-- ============================================================================


DELIMITER //

-- Trigger: Update room status when reservation is checked in
CREATE TRIGGER trg_reservation_checkin_update_room
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
  IF NEW.status = 'checked_in' AND OLD.status != 'checked_in' THEN
    UPDATE rooms 
    SET status = 'occupied',
        status_changed_at = NOW(),
        status_changed_by = NEW.checked_in_by
    WHERE room_id = NEW.room_id;
  END IF;
END//

-- Trigger: Update room status when reservation is checked out
CREATE TRIGGER trg_reservation_checkout_update_room
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
  IF NEW.status = 'checked_out' AND OLD.status != 'checked_out' THEN
    UPDATE rooms 
    SET status = 'cleaning',
        status_changed_at = NOW(),
        status_changed_by = NEW.checked_out_by
    WHERE room_id = NEW.room_id;
  END IF;
END//

-- Trigger: Update invoice balance when payment is made
CREATE TRIGGER trg_payment_update_invoice_balance
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE invoices
    SET 
      amount_paid = amount_paid + NEW.amount,
      balance_due = total_amount - (amount_paid + NEW.amount),
      status = CASE
        WHEN (total_amount - (amount_paid + NEW.amount)) <= 0 THEN 'paid'
        WHEN (amount_paid + NEW.amount) > 0 THEN 'partially_paid'
        ELSE status
      END,
      paid_at = CASE
        WHEN (total_amount - (amount_paid + NEW.amount)) <= 0 THEN NOW()
        ELSE paid_at
      END
    WHERE invoice_id = NEW.invoice_id;
  END IF;
END//

-- Trigger: Update invoice balance when payment is refunded
CREATE TRIGGER trg_payment_refund_update_invoice
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
  IF NEW.status = 'refunded' AND OLD.status != 'refunded' THEN
    UPDATE invoices
    SET 
      amount_paid = amount_paid - NEW.amount,
      balance_due = total_amount - (amount_paid - NEW.amount),
      status = CASE
        WHEN (amount_paid - NEW.amount) <= 0 THEN 'pending'
        WHEN (amount_paid - NEW.amount) < total_amount THEN 'partially_paid'
        ELSE status
      END
    WHERE invoice_id = NEW.invoice_id;
  END IF;
END//

-- Trigger: Update guest loyalty stats after checkout
CREATE TRIGGER trg_update_guest_loyalty_after_checkout
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
  DECLARE nights_stayed INT;
  DECLARE amount_spent DECIMAL(12,2);
  
  IF NEW.status = 'checked_out' AND OLD.status != 'checked_out' THEN
    SET nights_stayed = NEW.stay_units;
    SET amount_spent = NEW.total_room_charge - NEW.discount_amount;
    
    UPDATE guests
    SET 
      total_stays = total_stays + 1,
      total_nights = total_nights + nights_stayed,
      total_spent = total_spent + amount_spent,
      loyalty_tier = CASE
        WHEN (total_spent + amount_spent) >= 5000 THEN 'platinum'
        WHEN (total_spent + amount_spent) >= 2000 THEN 'gold'
        WHEN (total_spent + amount_spent) >= 1000 THEN 'silver'
        WHEN (total_stays + 1) >= 5 THEN 'bronze'
        ELSE loyalty_tier
      END
    WHERE guest_id = NEW.guest_id;
  END IF;
END//

-- Trigger: Auto-generate booking number
CREATE TRIGGER trg_generate_booking_number
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    SET NEW.booking_number = CONCAT(
      'BK',
      DATE_FORMAT(NOW(), '%Y%m%d'),
      '-',
      LPAD(NEW.property_id, 3, '0'),
      '-',
      LPAD((SELECT COALESCE(MAX(booking_id), 0) + 1 FROM bookings), 6, '0')
    );
  END IF;
END//

-- Trigger: Auto-generate reservation number
CREATE TRIGGER trg_generate_reservation_number
BEFORE INSERT ON reservations
FOR EACH ROW
BEGIN
  IF NEW.reservation_number IS NULL OR NEW.reservation_number = '' THEN
    SET NEW.reservation_number = CONCAT(
      'RES',
      DATE_FORMAT(NOW(), '%Y%m%d'),
      '-',
      LPAD(NEW.property_id, 3, '0'),
      '-',
      LPAD((SELECT COALESCE(MAX(reservation_id), 0) + 1 FROM reservations), 6, '0')
    );
  END IF;
END//

-- Trigger: Auto-generate invoice number
CREATE TRIGGER trg_generate_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    SET NEW.invoice_number = CONCAT(
      'INV',
      DATE_FORMAT(NOW(), '%Y%m%d'),
      '-',
      LPAD(NEW.property_id, 3, '0'),
      '-',
      LPAD((SELECT COALESCE(MAX(invoice_id), 0) + 1 FROM invoices), 6, '0')
    );
  END IF;
END//

-- Trigger: Validate promo code before booking
CREATE TRIGGER trg_validate_promo_code_usage
BEFORE INSERT ON promo_code_uses
FOR EACH ROW
BEGIN
  DECLARE current_usage INT;
  DECLARE max_usage INT;
  DECLARE guest_usage INT;
  DECLARE max_per_guest INT;
  
  SELECT current_uses, max_uses, max_uses_per_guest
  INTO current_usage, max_usage, max_per_guest
  FROM promo_codes
  WHERE promo_id = NEW.promo_id;
  
  -- Check if promo code has reached max uses
  IF max_usage IS NOT NULL AND current_usage >= max_usage THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Promo code has reached maximum usage limit';
  END IF;
  
  -- Check guest usage limit
  SELECT COUNT(*)
  INTO guest_usage
  FROM promo_code_uses
  WHERE promo_id = NEW.promo_id AND guest_id = NEW.guest_id;
  
  IF guest_usage >= max_per_guest THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'You have already used this promo code maximum times';
  END IF;
  
  -- Increment usage counter
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE promo_id = NEW.promo_id;
END //

DELIMITER ;

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- View: Available rooms with details
CREATE VIEW v_available_rooms AS
SELECT 
  r.room_id,
  r.property_id,
  p.property_name,
  r.room_number,
  r.floor,
  rt.type_name,
  rt.room_class,
  rt.bed_type,
  rt.bed_count,
  rt.nightly_price,
  rt.hourly_price,
  rt.max_occupancy,
  r.status,
  r.last_cleaned_at
FROM rooms r
JOIN room_types rt ON r.room_type_id = rt.room_type_id
JOIN properties p ON r.property_id = p.property_id
WHERE r.status = 'available'
  AND rt.status = 'active'
  AND p.is_active = TRUE;

-- View: Today's arrivals
CREATE VIEW v_todays_arrivals AS
SELECT 
  res.reservation_id,
  res.reservation_number,
  res.check_in_at,
  r.room_number,
  rt.type_name,
  g.first_name,
  g.last_name,
  g.phone,
  g.email,
  res.adults,
  res.children,
  res.status,
  b.booking_source
FROM reservations res
JOIN rooms r ON res.room_id = r.room_id
JOIN room_types rt ON res.room_type_id = rt.room_type_id
JOIN guests g ON res.guest_id = g.guest_id
JOIN bookings b ON res.booking_id = b.booking_id
WHERE DATE(res.check_in_at) = CURDATE()
  AND res.status IN ('confirmed', 'pending')
ORDER BY res.check_in_at;

-- View: Today's departures
CREATE VIEW v_todays_departures AS
SELECT 
  res.reservation_id,
  res.reservation_number,
  res.check_out_at,
  r.room_number,
  rt.type_name,
  g.first_name,
  g.last_name,
  g.phone,
  res.status,
  i.invoice_id,
  i.total_amount,
  i.amount_paid,
  i.balance_due,
  i.status as invoice_status
FROM reservations res
JOIN rooms r ON res.room_id = r.room_id
JOIN room_types rt ON res.room_type_id = rt.room_type_id
JOIN guests g ON res.guest_id = g.guest_id
LEFT JOIN invoices i ON i.reservation_id = res.reservation_id
WHERE DATE(res.check_out_at) = CURDATE()
  AND res.status = 'checked_in'
ORDER BY res.check_out_at;

-- View: Current occupancy status
CREATE VIEW v_occupancy_status AS
SELECT 
  p.property_id,
  p.property_name,
  COUNT(r.room_id) as total_rooms,
  SUM(CASE WHEN r.status = 'available' THEN 1 ELSE 0 END) as available_rooms,
  SUM(CASE WHEN r.status = 'occupied' THEN 1 ELSE 0 END) as occupied_rooms,
  SUM(CASE WHEN r.status = 'cleaning' THEN 1 ELSE 0 END) as cleaning_rooms,
  SUM(CASE WHEN r.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_rooms,
  SUM(CASE WHEN r.status = 'out_of_order' THEN 1 ELSE 0 END) as out_of_order_rooms,
  ROUND((SUM(CASE WHEN r.status = 'occupied' THEN 1 ELSE 0 END) / COUNT(r.room_id)) * 100, 2) as occupancy_rate
FROM properties p
LEFT JOIN rooms r ON p.property_id = r.property_id
WHERE p.is_active = TRUE
GROUP BY p.property_id, p.property_name;


-- View: Revenue summary
CREATE VIEW v_revenue_summary AS
SELECT 
  p.property_id,
  p.property_name,
  DATE(pay.payment_date) as payment_date,
  pay.payment_method,
  COUNT(pay.payment_id) as transaction_count,
  SUM(pay.amount) as total_amount,
  pay.payment_currency as currency
FROM payments pay
JOIN invoices i ON pay.invoice_id = i.invoice_id
JOIN properties p ON i.property_id = p.property_id
WHERE pay.status = 'completed'
GROUP BY p.property_id, p.property_name, DATE(pay.payment_date), pay.payment_method, pay.payment_currency;

-- View: Outstanding invoices
CREATE VIEW v_outstanding_invoices AS
SELECT 
  i.invoice_id,
  i.invoice_number,
  i.property_id,
  p.property_name,
  i.issued_at,
  i.due_date,
  b.booking_number,
  g.first_name,
  g.last_name,
  g.phone,
  g.email,
  i.total_amount,
  i.amount_paid,
  i.balance_due,
  i.currency,
  DATEDIFF(CURDATE(), i.due_date) as days_overdue
FROM invoices i
JOIN bookings b ON i.booking_id = b.booking_id
JOIN guests g ON b.primary_guest_id = g.guest_id
JOIN properties p ON i.property_id = p.property_id
WHERE i.balance_due > 0
  AND i.status IN ('pending', 'partially_paid')
ORDER BY i.due_date;

-- ============================================================================
-- INITIAL DATA - ROLES & PERMISSIONS
-- ============================================================================

-- Insert default roles
INSERT INTO roles (role_name, display_name, description, is_active) VALUES
('super_admin', 'Super Administrator', 'Full system access', TRUE),
('property_owner', 'Property Owner', 'Owner of property', TRUE),
('manager', 'Manager', 'Property manager with full operational access', TRUE),
('receptionist', 'Receptionist', 'Front desk operations', TRUE),
('housekeeping', 'Housekeeping', 'Room cleaning and maintenance', TRUE),
('accountant', 'Accountant', 'Financial and billing access', TRUE);
