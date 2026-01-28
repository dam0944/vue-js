// Static data that follows DB table: room_keys

export const roomKeysData = [
  {
    room_id: 101,
    room_number: "101",
    keys: [
      {
        key_id: 1,
        key_number: "101-A",
        key_type: "physical", // physical | card | code | digital
        status: "available",  // available | issued | lost | damaged
        issued_to_reservation_id: null,
        issued_at: null,
        returned_at: null,
        replacement_cost: 5.0,
        notes: "",
      },
      {
        key_id: 2,
        key_number: "101-B",
        key_type: "card",
        status: "issued",
        issued_to_reservation_id: 5001,
        issued_at: "2026-01-28 14:12:00",
        returned_at: null,
        replacement_cost: 10.0,
        notes: "Guest keeps card in wallet",
      },
    ],
  },

  {
    room_id: 102,
    room_number: "102",
    keys: [
      {
        key_id: 3,
        key_number: "102-A",
        key_type: "physical",
        status: "available",
        issued_to_reservation_id: null,
        issued_at: null,
        returned_at: null,
        replacement_cost: 5.0,
        notes: "",
      },
      {
        key_id: 4,
        key_number: "102-B",
        key_type: "physical",
        status: "lost",
        issued_to_reservation_id: 5003,
        issued_at: "2026-01-25 20:10:00",
        returned_at: null,
        replacement_cost: 5.0,
        notes: "Guest reported lost at checkout",
      },
    ],
  },

  {
    room_id: 201,
    room_number: "201",
    keys: [
      {
        key_id: 5,
        key_number: "201-A",
        key_type: "card",
        status: "available",
        issued_to_reservation_id: null,
        issued_at: null,
        returned_at: null,
        replacement_cost: 10.0,
        notes: "",
      },
      {
        key_id: 6,
        key_number: "201-B",
        key_type: "digital",
        status: "damaged",
        issued_to_reservation_id: null,
        issued_at: null,
        returned_at: null,
        replacement_cost: 0.0,
        notes: "Digital lock not responding",
      },
    ],
  },

  {
    room_id: 202,
    room_number: "202",
    keys: [
      {
        key_id: 7,
        key_number: "202-A",
        key_type: "physical",
        status: "issued",
        issued_to_reservation_id: 5008,
        issued_at: "2026-01-28 09:40:00",
        returned_at: null,
        replacement_cost: 5.0,
        notes: "",
      },
      {
        key_id: 8,
        key_number: "202-B",
        key_type: "physical",
        status: "available",
        issued_to_reservation_id: null,
        issued_at: null,
        returned_at: null,
        replacement_cost: 5.0,
        notes: "",
      },
    ],
  },

  {
    room_id: 301,
    room_number: "301",
    keys: [
      {
        key_id: 9,
        key_number: "301-A",
        key_type: "card",
        status: "available",
        issued_to_reservation_id: null,
        issued_at: null,
        returned_at: null,
        replacement_cost: 10.0,
        notes: "",
      },
    ],
  },
]
