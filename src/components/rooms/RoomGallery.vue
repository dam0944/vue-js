<template>
  <div class="room-gallery">
    <!-- Main Image -->
    <div class="relative bg-black rounded-lg overflow-hidden mb-4">
      <img 
        :src="currentImage"
        :alt="`Room image ${currentIndex + 1}`"
        class="w-full h-96 object-contain"
      >
      
      <!-- Navigation Arrows -->
      <button 
        v-if="images.length > 1"
        @click="previousImage"
        class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
      >
        ←
      </button>
      
      <button 
        v-if="images.length > 1"
        @click="nextImage"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
      >
        →
      </button>
      
      <!-- Image Counter -->
      <div class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <!-- Thumbnail Grid -->
    <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
      <div 
        v-for="(image, index) in images" 
        :key="index"
        @click="currentIndex = index"
        :class="{ 'ring-2 ring-blue-500': index === currentIndex }"
        class="cursor-pointer rounded overflow-hidden hover:opacity-75 transition"
      >
        <img 
          :src="image"
          :alt="`Thumbnail ${index + 1}`"
          class="w-full h-20 object-cover"
        >
      </div>
    </div>

    <!-- Fullscreen Button -->
    <button 
      @click="openFullscreen"
      class="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      View Fullscreen
    </button>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'RoomGallery',
  props: {
    images: {
      type: Array,
      default: () => ['/assets/images/default-room.jpg']
    }
  },
  setup(props) {
    const currentIndex = ref(0);

    const currentImage = computed(() => {
      return props.images[currentIndex.value] || props.images[0];
    });

    const previousImage = () => {
      currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
    };

    const nextImage = () => {
      currentIndex.value = (currentIndex.value + 1) % props.images.length;
    };

    const openFullscreen = () => {
      // You can implement a modal/lightbox here
      alert('Fullscreen view would open here');
    };

    return {
      currentIndex,
      currentImage,
      previousImage,
      nextImage,
      openFullscreen
    };
  }
};
</script>
