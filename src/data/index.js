// src/data/index.js
export const property = {
  property_id: 1,
  property_code: "GH01",
  property_name: "Family Guesthouse",
  city: "Phnom Penh",
}

// room_types (minimal fields needed)
export const roomTypes = [
  {
    room_type_id: 1,
    type_name: "Simple",
    bed_count: 1,
    base_price: 18,
    status: "active",
  },
  {
    room_type_id: 2,
    type_name: "Simple",
    bed_count: 2,
    base_price: 25,
    status: "active",
  },
  {
    room_type_id: 3,
    type_name: "VIP",
    bed_count: 1,
    base_price: 35,
    status: "active",
  },
  {
    room_type_id: 4,
    type_name: "VIP",
    bed_count: 2,
    base_price: 50,
    status: "active",
  },
]

// rooms table fields (include image_url)
export const rooms = [
  {
    room_id: 11,
    property_id: 1,
    room_number: "101",
    room_type_id: 1,
    floor: 1,
    building: "Main",
    status: "available",
    current_reservation_id: null,
    last_cleaned: null,
    last_inspected: null,
    next_maintenance_date: null,
    condition_rating: "good",
    notes: "",
    image_url: "", // can be url OR base64 string for demo
  },
]
