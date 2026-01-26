import { rooms } from "./room"
import { roomTypes } from "./roomTypes"
import { roomFeatures } from "./roomfeature"
import { bookings } from "./bookings"

// Example room_type_features mapping (pivot)
const roomTypeFeatures = [
  // Standard
  { room_type_id: 1, feature_id: 1 },
  { room_type_id: 1, feature_id: 2 },
  { room_type_id: 1, feature_id: 3 },
  { room_type_id: 1, feature_id: 5 },

  // Deluxe
  { room_type_id: 2, feature_id: 1 },
  { room_type_id: 2, feature_id: 2 },
  { room_type_id: 2, feature_id: 3 },
  { room_type_id: 2, feature_id: 4 },
  { room_type_id: 2, feature_id: 6 },
  { room_type_id: 2, feature_id: 5 },

  // Family Suite
  { room_type_id: 3, feature_id: 1 },
  { room_type_id: 3, feature_id: 2 },
  { room_type_id: 3, feature_id: 3 },
  { room_type_id: 3, feature_id: 8 },
  { room_type_id: 3, feature_id: 6 },
  { room_type_id: 3, feature_id: 5 },

  // VIP
  { room_type_id: 4, feature_id: 1 },
  { room_type_id: 4, feature_id: 2 },
  { room_type_id: 4, feature_id: 3 },
  { room_type_id: 4, feature_id: 4 },
  { room_type_id: 4, feature_id: 8 },
  { room_type_id: 4, feature_id: 6 },
  { room_type_id: 4, feature_id: 7 },
  { room_type_id: 4, feature_id: 9 },
]

export const dbRoomsForUI = rooms.map((r) => {
  const type = roomTypes.find((t) => t.room_type_id === r.room_type_id)

  const featureIds = roomTypeFeatures
    .filter((p) => p.room_type_id === r.room_type_id)
    .map((p) => p.feature_id)

  const features = roomFeatures
    .filter((f) => featureIds.includes(f.feature_id))
    .map((f) => f.feature_name)

  return {
    id: r.room_id,
    roomNumber: r.room_number,
    floor: r.floor,
    status: r.status,
    notes: r.notes,
    type: {
      id: type?.room_type_id,
      name: type?.type_name,
      basePrice: Number(type?.base_price || 0),
      maxOccupancy: type?.max_occupancy,
      bedType: type?.bed_type,
      roomSizeSqm: type?.room_size_sqm,
      imageUrl: type?.image_url,
      features,
    },
  }
})

export { rooms, roomTypes, roomFeatures, roomTypeFeatures, bookings }
