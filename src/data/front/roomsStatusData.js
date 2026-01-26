
export const roomsStatusData = [
  {
    // ---- rooms table ----
    room_id: 1,
    room_number: "101",
    floor: 1,
    building: "A",
    status: "available", // available | occupied | cleaning | maintenance | blocked
    last_cleaned_at: "2026-01-25 08:10:00",

    // ---- room_types table ----
    room_type: {
      room_type_id: 1,
      type_name: "Simple 1 Bed",
      room_class: "simple",
      bed_count: 1,
      nightly_price: 15,
      hourly_price: 4,
      max_occupancy: 2,
    },

    // ---- reservation (NULL because available) ----
    current_reservation: null,

    // ---- housekeeping_tasks ----
    housekeeping: {
      task_id: null,
      status: null, // pending | in_progress | completed
      assigned_to: null,
    },
  },

  {
    room_id: 2,
    room_number: "102",
    floor: 1,
    building: "A",
    status: "occupied",
    last_cleaned_at: "2026-01-24 16:00:00",

    room_type: {
      room_type_id: 1,
      type_name: "Simple 1 Bed",
      room_class: "simple",
      bed_count: 1,
      nightly_price: 15,
      hourly_price: 4,
      max_occupancy: 2,
    },

    // ---- reservations + guests ----
    current_reservation: {
      reservation_id: 25,
      reservation_number: "RS-20260125-0025",
      booking_type: "nightly",
      check_in_at: "2026-01-25 10:20:00",
      check_out_at: "2026-01-26 12:00:00",
      stay_units: 1,
      adults: 1,
      children: 0,
      total_room_charge: 15,
      status: "checked_in",

      guest: {
        guest_id: 101,
        guest_number: "G202600101",
        first_name: "Sok",
        last_name: "Dara",
        phone: "012345678",
        vip_status: false,
      },
    },

    housekeeping: {
      task_id: 201,
      status: "completed",
      assigned_to: "Davy",
    },
  },

  {
    room_id: 3,
    room_number: "103",
    floor: 1,
    building: "A",
    status: "cleaning",
    last_cleaned_at: "2026-01-25 07:30:00",

    room_type: {
      room_type_id: 2,
      type_name: "Simple 2 Beds",
      room_class: "simple",
      bed_count: 2,
      nightly_price: 20,
      hourly_price: 5,
      max_occupancy: 3,
    },

    current_reservation: null,

    housekeeping: {
      task_id: 202,
      status: "in_progress",
      assigned_to: "Sreyneang",
    },
  },

  {
    room_id: 4,
    room_number: "201",
    floor: 2,
    building: "B",
    status: "available",
    last_cleaned_at: "2026-01-25 08:40:00",

    room_type: {
      room_type_id: 3,
      type_name: "VIP 1 Bed",
      room_class: "vip",
      bed_count: 1,
      nightly_price: 30,
      hourly_price: 8,
      max_occupancy: 2,
    },

    current_reservation: {
      reservation_id: 26,
      reservation_number: "RS-20260125-0026",
      booking_type: "nightly",
      check_in_at: "2026-01-25 15:00:00",
      check_out_at: "2026-01-26 12:00:00",
      stay_units: 1,
      adults: 2,
      children: 0,
      total_room_charge: 30,
      status: "confirmed",

      guest: {
        guest_id: 102,
        guest_number: "G202600102",
        first_name: "Linda",
        last_name: "Chen",
        phone: "098765432",
        vip_status: true,
      },
    },

    housekeeping: {
      task_id: null,
      status: null,
      assigned_to: null,
    },
  },

  {
    room_id: 5,
    room_number: "202",
    floor: 2,
    building: "B",
    status: "maintenance",
    last_cleaned_at: "2026-01-23 09:00:00",

    room_type: {
      room_type_id: 3,
      type_name: "VIP 1 Bed",
      room_class: "vip",
      bed_count: 1,
      nightly_price: 30,
      hourly_price: 8,
      max_occupancy: 2,
    },

    current_reservation: null,

    housekeeping: {
      task_id: null,
      status: null,
      assigned_to: null,
    },
  },
];
