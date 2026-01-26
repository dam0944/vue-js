<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import RoomCard from "@/components/rooms/RoomCard.vue";
import { dbRoomsForUI } from "@/data/rooms";

const router = useRouter();

const rooms = ref([...dbRoomsForUI]);

const search = ref("");
const status = ref("");
const type = ref("");
const sort = ref("room");

const statusOptions = [
  "available",
  "occupied",
  "reserved",
  "maintenance",
  "out_of_order",
  "cleaning",
];

const typeOptions = computed(() => {
  const s = new Set();
  rooms.value.forEach((r) => s.add(r.type.name));
  return Array.from(s);
});

const filteredRooms = computed(() => {
  let list = rooms.value.filter((r) => {
    return (
      (!search.value || r.roomNumber.includes(search.value)) &&
      (!status.value || r.status === status.value) &&
      (!type.value || r.type.name === type.value)
    );
  });

  if (sort.value === "room")
    list.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  if (sort.value === "price") list.sort((a, b) => a.type.basePrice - b.type.basePrice);
  if (sort.value === "floor") list.sort((a, b) => a.floor - b.floor);

  return list;
});

const goCreate = () => router.push("/admin/rooms/create");
const goEdit = (r) => router.push(`/admin/rooms/${r.id}/edit`);

function formatStatus(s) {
  return s.replace("_", " ").toUpperCase();
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Rooms</h1>
      <VaButton color="success" icon="add" @click="goCreate">Add Room</VaButton>
    </div>

    <VaCard class="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <VaInput v-model="search" placeholder="Search room..." />
      <VaSelect v-model="status" :options="['', ...statusOptions]" label="Status" />
      <VaSelect v-model="type" :options="['', ...typeOptions]" label="Type" />
      <VaSelect v-model="sort" :options="['room', 'floor', 'price']" label="Sort" />
    </VaCard>

    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <RoomCard
        v-for="r in filteredRooms"
        :key="r.id"
        :room="{
          name: 'Room ' + r.roomNumber,
          type: r.type.name,
          status: formatStatus(r.status),
          maxOccupancy: r.type.maxOccupancy,
          bedType: r.type.bedType,
          size: r.type.roomSizeSqm,
          pricePerNight: r.type.basePrice,
          image: r.type.imageUrl,
          amenities: r.type.features,
        }"
        @edit="goEdit(r)"
      />
    </div>
  </div>
</template>
