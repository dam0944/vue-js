<template>
  <div class="room-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div class="relative">
      <img 
        :src="room.image || '/assets/images/default-room.jpg'" 
        :alt="room.name"
        class="w-full h-48 object-cover cursor-pointer"
        @click="$emit('view-gallery', room)"
      >
      <span 
        :class="statusClass"
        class="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold"
      >
        {{ room.status }}
      </span>
    </div>
    
    <div class="p-4">
      <h3 class="text-lg font-bold text-gray-800">{{ room.name }}</h3>
      <p class="text-sm text-gray-600">{{ room.type }}</p>
      
      <div class="mt-3 flex items-center gap-2 text-sm text-gray-600">
        <span>👤 Max: {{ room.maxOccupancy }}</span>
        <span>🛏️ {{ room.bedType }}</span>
        <span>📐 {{ room.size }}m²</span>
      </div>
      
      <div class="mt-3 flex flex-wrap gap-2">
        <span v-for="amenity in room.amenities.slice(0, 4)" :key="amenity"
          class="text-xs bg-gray-100 px-2 py-1 rounded">
          {{ amenity }}
        </span>
        <span v-if="room.amenities.length > 4" class="text-xs text-gray-500">
          +{{ room.amenities.length - 4 }} more
        </span>
      </div>
      
      <div class="mt-4 flex items-center justify-between">
        <div>
          <span class="text-2xl font-bold text-blue-600">${{ room.pricePerNight }}</span>
          <span class="text-sm text-gray-600">/night</span>
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="$emit('edit', room)"
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Edit
          </button>
          <button 
            @click="$emit('view-details', room)"
            class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoomCard',
  props: {
    room: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'view-details', 'view-gallery'],
  computed: {
    statusClass() {
      const statusColors = {
        'Available': 'bg-green-500 text-white',
        'Occupied': 'bg-red-500 text-white',
        'Maintenance': 'bg-yellow-500 text-white',
        'Cleaning': 'bg-blue-500 text-white'
      };
      return statusColors[this.room.status] || 'bg-gray-500 text-white';
    }
  }
};
</script>
