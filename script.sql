SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- PROPERTIES
-- ==========================================
CREATE TABLE properties (
  property_id INT PRIMARY KEY AUTO_INCREMENT,
  property_code VARCHAR(20) UNIQUE NOT NULL COMMENT 'GH01',
  property_name VARCHAR(150) NOT NULL,
  property_name_khmer VARCHAR(150),
  property_type ENUM('guesthouse','hotel') DEFAULT 'guesthouse',

  address TEXT,
  city VARCHAR(100) DEFAULT 'Phnom Penh',
  province VARCHAR(100),
  country VARCHAR(50) DEFAULT 'Cambodia',
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),

  total_rooms INT DEFAULT 0,
  total_floors INT DEFAULT 1,

  is_active BOOLEAN DEFAULT TRUE,
  logo_url VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_active (is_active),
  INDEX idx_code (property_code)
) ENGINE=InnoDB;

-- ==========================================
-- USERS / ROLES / PERMISSIONS
-- ==========================================
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NULL COMMENT 'NULL = access all',
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
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_position (position),
  INDEX idx_property (property_id)
) ENGINE=InnoDB;

CREATE TABLE system_config (
  config_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NULL COMMENT 'NULL = global',
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
) ENGINE=InnoDB;

CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE user_roles (
  user_role_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role_id)
) ENGINE=InnoDB;

CREATE TABLE user_sessions (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE permissions (
  permission_id INT PRIMARY KEY AUTO_INCREMENT,
  permission_code VARCHAR(100) UNIQUE NOT NULL,
  permission_name VARCHAR(150) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

-- ==========================================
-- GUESTS
-- ==========================================

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
  vip_status BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  INDEX idx_phone (phone),
  INDEX idx_name (last_name, first_name),
  INDEX idx_guest_number (guest_number),
  INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE guest_documents (
  document_id INT PRIMARY KEY AUTO_INCREMENT,
  guest_id INT NOT NULL,
  document_type ENUM('id_card','passport','visa','driving_license','other') NOT NULL,
  document_number VARCHAR(100),
  document_file_path VARCHAR(500),
  expiry_date DATE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT,
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
  INDEX idx_guest (guest_id)
) ENGINE=InnoDB;

-- ==========================================
-- ROOM TYPES & ROOMS
-- ==========================================
CREATE TABLE room_types (
  room_type_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,

  room_class ENUM('simple','vip') NOT NULL DEFAULT 'simple',
  bed_count TINYINT NOT NULL DEFAULT 1 COMMENT '1 or 2',

  type_code VARCHAR(20) NOT NULL COMMENT 'SIMPLE1, VIP2',
  type_name VARCHAR(50) NOT NULL COMMENT 'Simple/VIP',
  type_name_khmer VARCHAR(100),

  nightly_price DECIMAL(12,2) NOT NULL,
  hourly_price DECIMAL(12,2) NULL,
  monthly_price DECIMAL(12,2) NULL,

  max_occupancy INT NOT NULL DEFAULT 2,
  description TEXT,
  amenities TEXT COMMENT 'JSON array of amenities',
  status ENUM('active','inactive') DEFAULT 'active',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  UNIQUE KEY uniq_property_typecode (property_id, type_code),
  INDEX idx_class_bed (room_class, bed_count),
  INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE rooms (
  room_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  room_number VARCHAR(20) NOT NULL,
  room_type_id INT NOT NULL,
  floor INT,
  building VARCHAR(50),

  status ENUM('available','occupied','cleaning','maintenance','out_of_order','blocked') DEFAULT 'available',
  last_cleaned_at TIMESTAMP NULL,
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id),

  UNIQUE KEY unique_property_room (property_id, room_number),
  INDEX idx_status (status),
  INDEX idx_property (property_id),
  INDEX idx_type (room_type_id)
) ENGINE=InnoDB;

-- ==========================================
-- ROOM IMAGES (for POS display)
-- ==========================================
CREATE TABLE room_images (
  image_id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NULL COMMENT 'NULL = room type image',
  room_type_id INT NULL COMMENT 'NULL = specific room image',
  
  image_url VARCHAR(500) NOT NULL,
  image_title VARCHAR(150),
  image_description TEXT,
  
  display_order INT DEFAULT 0 COMMENT 'Order to display images',
  is_primary BOOLEAN DEFAULT FALSE COMMENT 'Main image to show in POS',
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
  
  CHECK (room_id IS NOT NULL OR room_type_id IS NOT NULL)
) ENGINE=InnoDB;

-- ==========================================
-- BOOKINGS & RESERVATIONS
-- ==========================================
CREATE TABLE bookings (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  booking_number VARCHAR(50) UNIQUE NOT NULL,

  primary_guest_id INT NOT NULL,
  booking_source ENUM('walk_in','phone','other') NOT NULL DEFAULT 'walk_in',

  status ENUM('pending','confirmed','checked_in','checked_out','cancelled','no_show') DEFAULT 'pending',
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  deposit_amount DECIMAL(12,2) DEFAULT 0,
  deposit_paid DECIMAL(12,2) DEFAULT 0,

  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP NULL,
  
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (primary_guest_id) REFERENCES guests(guest_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id),

  INDEX idx_property (property_id),
  INDEX idx_status (status),
  INDEX idx_date (booking_date),
  INDEX idx_guest (primary_guest_id)
) ENGINE=InnoDB;

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
  
  stay_units INT NOT NULL COMMENT 'hours if hourly, nights if nightly, months if monthly',

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
  INDEX idx_guest (guest_id)
) ENGINE=InnoDB;

-- ==========================================
-- ADDITIONAL CHARGES
-- ==========================================
CREATE TABLE additional_charges (
  charge_id INT PRIMARY KEY AUTO_INCREMENT,
  reservation_id INT NOT NULL,
  charge_type ENUM('late_checkout','early_checkin','extra_bed','damage','lost_key','cleaning_fee','other') NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  quantity INT DEFAULT 1,
  total_amount DECIMAL(12,2) NOT NULL,
  currency ENUM('USD','KHR') DEFAULT 'USD',
  
  charged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  charged_by INT NULL,
  
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  FOREIGN KEY (charged_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_reservation (reservation_id),
  INDEX idx_type (charge_type)
) ENGINE=InnoDB;

-- ==========================================
-- INVOICES & PAYMENTS (POS)
-- ==========================================
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
  INDEX idx_date (issued_at)
) ENGINE=InnoDB;

CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  invoice_id INT NOT NULL,
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cash','credit_card','debit_card','bank_transfer','aba','wing','true_money','other') NOT NULL,
  payment_currency ENUM('USD','KHR') DEFAULT 'USD',
  exchange_rate DECIMAL(10,4) DEFAULT 1.0000 COMMENT 'Rate used if different from invoice currency',
  amount_in_base_currency DECIMAL(12,2) COMMENT 'Converted amount if needed',
  
  reference_number VARCHAR(100) COMMENT 'Bank ref, card last 4 digits, transaction ID',
  card_type VARCHAR(50) COMMENT 'Visa, Mastercard, etc',
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
  INDEX idx_number (payment_number)
) ENGINE=InnoDB;

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
) ENGINE=InnoDB;

CREATE TABLE invoice_items (
  item_id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  reservation_id INT NULL,
  additional_charge_id INT NULL,
  
  item_type ENUM('room_charge','additional_charge','discount','tax','other') NOT NULL,
  description VARCHAR(255) NOT NULL,
  
  quantity DECIMAL(10,2) DEFAULT 1 COMMENT 'Nights, hours, or item count',
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
) ENGINE=InnoDB;

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
  INDEX idx_date (issued_at)
) ENGINE=InnoDB;

-- ==========================================
-- DAILY CLOSING & CASH DRAWER
-- ==========================================

CREATE TABLE daily_closings (
  closing_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  closing_number VARCHAR(50) UNIQUE NOT NULL,
  
  business_date DATE NOT NULL,
  shift_type ENUM('morning','afternoon','evening','full_day') DEFAULT 'full_day',
  
  opening_cash DECIMAL(12,2) DEFAULT 0,
  closing_cash DECIMAL(12,2) NOT NULL,
  expected_cash DECIMAL(12,2) NOT NULL,
  cash_difference DECIMAL(12,2) GENERATED ALWAYS AS (closing_cash - expected_cash) STORED,
  
  total_cash_sales DECIMAL(12,2) DEFAULT 0,
  total_card_sales DECIMAL(12,2) DEFAULT 0,
  total_bank_transfers DECIMAL(12,2) DEFAULT 0,
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
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ==========================================
-- ROOM KEYS
-- ==========================================
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
  INDEX idx_reservation (issued_to_reservation_id)
) ENGINE=InnoDB;

-- ==========================================
-- HOUSEKEEPING
-- ==========================================
CREATE TABLE housekeeping_tasks (
  task_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  room_id INT NOT NULL,
  
  task_type ENUM('cleaning','maintenance','inspection','deep_clean') NOT NULL DEFAULT 'cleaning',
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  
  status ENUM('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  
  assigned_to INT NULL,
  assigned_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  notes TEXT,
  completion_notes TEXT,
  
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
  INDEX idx_date (created_at)
) ENGINE=InnoDB;

-- ==========================================
-- AUDIT LOG
-- ==========================================
CREATE TABLE audit_logs (
  log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NULL,
  user_id INT NULL,
  
  action_type VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, etc',
  table_name VARCHAR(100),
  record_id INT,
  
  old_values JSON,
  new_values JSON,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_property (property_id),
  INDEX idx_user (user_id),
  INDEX idx_action (action_type),
  INDEX idx_table (table_name),
  INDEX idx_date (created_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;