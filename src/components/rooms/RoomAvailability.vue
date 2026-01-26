<template>
  <div class="room-availability bg-white p-6 rounded-lg shadow">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-bold">Room Availability</h3>

      <div class="flex gap-2">
        <button
          @click="previousMonth"
          class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Prev
        </button>
        <span class="px-4 py-1 bg-gray-100 rounded">
          {{ currentMonthYear }}
        </span>
        <button
          @click="nextMonth"
          class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Next →
        </button>
      </div>
    </div>

    <!-- Room Filter -->
    <div class="mb-4">
      <select
        v-model="selectedRoom"
        class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Rooms</option>
        <option v-for="room in rooms" :key="room.id" :value="room.id">
          {{ room.name }}
        </option>
      </select>
    </div>

    <!-- Calendar Grid -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="border p-2 bg-gray-100">Sun</th>
            <th class="border p-2 bg-gray-100">Mon</th>
            <th class="border p-2 bg-gray-100">Tue</th>
            <th class="border p-2 bg-gray-100">Wed</th>
            <th class="border p-2 bg-gray-100">Thu</th>
            <th class="border p-2 bg-gray-100">Fri</th>
            <th class="border p-2 bg-gray-100">Sat</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, index) in calendarDays" :key="index">
            <td
              v-for="day in week"
              :key="day.date"
              :class="getDayClass(day)"
              class="border p-2 h-20 cursor-pointer hover:bg-gray-50"
              @click="selectDate(day)"
            >
              <div class="text-sm font-semibold">{{ day.day }}</div>
              <div v-if="day.availability" class="text-xs mt-1">
                {{ day.availability.available }}/{{ day.availability.total }} available
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-green-200 border"></div>
        <span>Available</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-red-200 border"></div>
        <span>Fully Booked</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-yellow-200 border"></div>
        <span>Partially Booked</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-gray-200 border"></div>
        <span>Past Date</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  name: "RoomAvailability",
  props: {
    rooms: {
      type: Array,
      required: true,
    },
    bookings: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["date-selected"],
  setup(props, { emit }) {
    const currentDate = ref(new Date());
    const selectedRoom = ref("");

    const currentMonthYear = computed(() => {
      const options = { month: "long", year: "numeric" };
      return currentDate.value.toLocaleDateString("en-US", options);
    });

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startingDayOfWeek = firstDay.getDay();

      const days = [];
      let week = [];

      // Fill in previous month days
      for (let i = 0; i < startingDayOfWeek; i++) {
        week.push({ day: "", date: null, isCurrentMonth: false });
      }

      // Fill in current month days
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const availability = getAvailabilityForDate(date);

        week.push({
          day,
          date: date.toISOString().split("T")[0],
          isCurrentMonth: true,
          availability,
        });

        if (week.length === 7) {
          days.push(week);
          week = [];
        }
      }

      // Fill in remaining days
      if (week.length > 0) {
        while (week.length < 7) {
          week.push({ day: "", date: null, isCurrentMonth: false });
        }
        days.push(week);
      }

      return days;
    });

    const getAvailabilityForDate = (date) => {
      const dateStr = date.toISOString().split("T")[0];
      const relevantRooms = selectedRoom.value
        ? props.rooms.filter((r) => r.id === selectedRoom.value)
        : props.rooms;

      const total = relevantRooms.length;
      const booked = props.bookings.filter(
        (b) =>
          dateStr >= b.checkIn &&
          dateStr < b.checkOut &&
          (!selectedRoom.value || b.roomId === selectedRoom.value)
      ).length;

      return {
        total,
        booked,
        available: total - booked,
      };
    };

    const getDayClass = (day) => {
      if (!day.isCurrentMonth) return "bg-gray-50 text-gray-400";

      const today = new Date().toISOString().split("T")[0];
      if (day.date < today) return "bg-gray-200";

      if (!day.availability) return "";

      const ratio = day.availability.available / day.availability.total;
      if (ratio === 1) return "bg-green-200";
      if (ratio === 0) return "bg-red-200";
      return "bg-yellow-200";
    };

    const selectDate = (day) => {
      if (day.isCurrentMonth && day.date) {
        emit("date-selected", {
          date: day.date,
          availability: day.availability,
        });
      }
    };

    const previousMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
      );
    };

    const nextMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
      );
    };

    return {
      selectedRoom,
      currentMonthYear,
      calendarDays,
      getDayClass,
      selectDate,
      previousMonth,
      nextMonth,
    };
  },
};
</script>
