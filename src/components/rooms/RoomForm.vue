<template>
  <div class="room-form bg-white p-6 rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-6">
      {{ isEdit ? "Edit Room" : "Add New Room" }}
    </h2>

    <form @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Room Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Room Name/Number *
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Room 101"
          />
        </div>

        <!-- Room Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Room Type *
          </label>
          <select
            v-model="formData.type"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Family">Family</option>
          </select>
        </div>

        <!-- Max Occupancy -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Max Occupancy *
          </label>
          <input
            v-model.number="formData.maxOccupancy"
            type="number"
            required
            min="1"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Bed Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> Bed Type * </label>
          <select
            v-model="formData.bedType"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Bed Type</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Queen">Queen</option>
            <option value="King">King</option>
            <option value="Twin">Twin Beds</option>
          </select>
        </div>

        <!-- Price per Night -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Price per Night ($) *
          </label>
          <input
            v-model.number="formData.pricePerNight"
            type="number"
            required
            min="0"
            step="0.01"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Room Size -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> Size (m²) </label>
          <input
            v-model.number="formData.size"
            type="number"
            min="0"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Floor -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> Floor </label>
          <input
            v-model="formData.floor"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 1st Floor"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> Status * </label>
          <select
            v-model="formData.status"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Cleaning">Cleaning</option>
          </select>
        </div>
      </div>

      <!-- Description -->
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2"> Description </label>
        <textarea
          v-model="formData.description"
          rows="3"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Room description..."
        ></textarea>
      </div>

      <!-- Amenities -->
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2"> Amenities </label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label
            v-for="amenity in availableAmenities"
            :key="amenity"
            class="flex items-center"
          >
            <input
              type="checkbox"
              :value="amenity"
              v-model="formData.amenities"
              class="mr-2"
            />
            {{ amenity }}
          </label>
        </div>
      </div>

      <!-- Image URL -->
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2"> Image URL </label>
        <input
          v-model="formData.image"
          type="text"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <!-- Form Actions -->
      <div class="mt-6 flex gap-3 justify-end">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {{ isEdit ? "Update Room" : "Create Room" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "RoomForm",
  props: {
    room: {
      type: Object,
      default: null,
    },
  },
  emits: ["submit", "cancel"],
  setup(props, { emit }) {
    const availableAmenities = [
      "WiFi",
      "Air Conditioning",
      "TV",
      "Mini Bar",
      "Safe",
      "Balcony",
      "Bathtub",
      "Shower",
      "Hair Dryer",
      "Iron",
      "Coffee Maker",
      "Telephone",
    ];

    const defaultFormData = {
      name: "",
      type: "",
      maxOccupancy: 2,
      bedType: "",
      pricePerNight: 0,
      size: 0,
      floor: "",
      status: "Available",
      description: "",
      amenities: [],
      image: "",
    };

    const formData = ref({ ...defaultFormData });
    const isEdit = ref(!!props.room);

    // Watch for room prop changes
    watch(
      () => props.room,
      (newRoom) => {
        if (newRoom) {
          formData.value = { ...newRoom };
          isEdit.value = true;
        } else {
          formData.value = { ...defaultFormData };
          isEdit.value = false;
        }
      },
      { immediate: true }
    );

    const handleSubmit = () => {
      emit("submit", { ...formData.value });
    };

    return {
      formData,
      isEdit,
      availableAmenities,
      handleSubmit,
    };
  },
};
</script>
