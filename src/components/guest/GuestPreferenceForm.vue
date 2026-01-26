<script setup>
import { reactive, watch, computed, defineExpose } from "vue"

const props = defineProps({
  mode: { type: String, default: "create" }, // create | edit
  value: { type: Object, default: null },
  roomTypeOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(["submit", "cancel"])

const model = reactive({
  preference_id: null,
  guest_id: null,
  guest_name: "",

  preferred_room_type: "",
  floor_preference: "mid_floor",
  quiet_room: false,
  non_smoking: true,
  near_elevator: false,

  bed_type: "queen",
  extra_pillow: false,
  extra_blanket: false,

  daily_cleaning: true,
  wake_up_call: false,
  late_checkout: false,
  preferred_checkin_time: "14:00",

  breakfast_included: false,
  vegetarian: false,
  halal_food: false,
  allergies: "None",

  special_notes: "",
})

watch(
  () => props.value,
  (v) => {
    if (!v) return
    model.preference_id = v.preference_id ?? null
    model.guest_id = v.guest_id ?? null
    model.guest_name = v.guest_name ?? ""

    model.preferred_room_type = v.room_preferences?.preferred_room_type ?? ""
    model.floor_preference = v.room_preferences?.floor_preference ?? "mid_floor"
    model.quiet_room = !!v.room_preferences?.quiet_room
    model.non_smoking = v.room_preferences?.non_smoking !== undefined ? !!v.room_preferences?.non_smoking : true
    model.near_elevator = !!v.room_preferences?.near_elevator

    model.bed_type = v.bedding_preferences?.bed_type ?? "queen"
    model.extra_pillow = !!v.bedding_preferences?.extra_pillow
    model.extra_blanket = !!v.bedding_preferences?.extra_blanket

    model.daily_cleaning = v.service_preferences?.daily_cleaning !== undefined ? !!v.service_preferences?.daily_cleaning : true
    model.wake_up_call = !!v.service_preferences?.wake_up_call
    model.late_checkout = !!v.service_preferences?.late_checkout
    model.preferred_checkin_time = v.service_preferences?.preferred_checkin_time ?? "14:00"

    model.breakfast_included = !!v.food_preferences?.breakfast_included
    model.vegetarian = !!v.food_preferences?.vegetarian
    model.halal_food = !!v.food_preferences?.halal_food
    model.allergies = v.food_preferences?.allergies ?? "None"

    model.special_notes = v.special_notes ?? ""
  },
  { immediate: true, deep: true }
)

const canSubmit = computed(() => model.guest_name.trim().length > 0)

function buildPayload() {
  return {
    preference_id: model.preference_id,
    guest_id: model.guest_id,
    guest_name: model.guest_name.trim(),

    room_preferences: {
      preferred_room_type: model.preferred_room_type,
      floor_preference: model.floor_preference,
      quiet_room: model.quiet_room,
      non_smoking: model.non_smoking,
      near_elevator: model.near_elevator,
    },
    bedding_preferences: {
      bed_type: model.bed_type,
      extra_pillow: model.extra_pillow,
      extra_blanket: model.extra_blanket,
    },
    service_preferences: {
      daily_cleaning: model.daily_cleaning,
      wake_up_call: model.wake_up_call,
      late_checkout: model.late_checkout,
      preferred_checkin_time: model.preferred_checkin_time,
    },
    food_preferences: {
      breakfast_included: model.breakfast_included,
      vegetarian: model.vegetarian,
      halal_food: model.halal_food,
      allergies: model.allergies,
    },
    special_notes: model.special_notes,
  }
}

function submit() {
  if (!canSubmit.value) {
    alert("Guest name is required.")
    return
  }
  emit("submit", buildPayload())
}

defineExpose({ submit })
</script>

<template>
  <div class="formGrid">
    <!-- Basic -->
    <VaCard class="block">
      <div class="blockTitle">Basic</div>

      <VaInput v-model="model.guest_name" label="Guest Name *" />
      <VaInput v-model="model.guest_id" label="Guest ID (optional)" />

      <VaSelect
        v-model="model.preferred_room_type"
        :options="roomTypeOptions"
        label="Preferred Room Type"
        placeholder="Select room type"
      />
      <VaSelect
        v-model="model.floor_preference"
        :options="['low_floor','mid_floor','high_floor']"
        label="Floor Preference"
      />

      <div class="switchRow">
        <div class="switchItem">
          <div class="switchLabel">Quiet Room</div>
          <VaSwitch v-model="model.quiet_room" />
        </div>
        <div class="switchItem">
          <div class="switchLabel">Non-Smoking</div>
          <VaSwitch v-model="model.non_smoking" />
        </div>
        <div class="switchItem">
          <div class="switchLabel">Near Elevator</div>
          <VaSwitch v-model="model.near_elevator" />
        </div>
      </div>
    </VaCard>

    <!-- Bedding -->
    <VaCard class="block">
      <div class="blockTitle">Bedding</div>

      <VaSelect v-model="model.bed_type" :options="['single','twin','queen','king']" label="Bed Type" />

      <div class="switchRow two">
        <div class="switchItem">
          <div class="switchLabel">Extra Pillow</div>
          <VaSwitch v-model="model.extra_pillow" />
        </div>
        <div class="switchItem">
          <div class="switchLabel">Extra Blanket</div>
          <VaSwitch v-model="model.extra_blanket" />
        </div>
      </div>
    </VaCard>

    <!-- Service -->
    <VaCard class="block">
      <div class="blockTitle">Service</div>

      <div class="switchRow three">
        <div class="switchItem">
          <div class="switchLabel">Daily Cleaning</div>
          <VaSwitch v-model="model.daily_cleaning" />
        </div>
        <div class="switchItem">
          <div class="switchLabel">Wake-up Call</div>
          <VaSwitch v-model="model.wake_up_call" />
        </div>
        <div class="switchItem">
          <div class="switchLabel">Late Checkout</div>
          <VaSwitch v-model="model.late_checkout" />
        </div>
      </div>

      <VaInput v-model="model.preferred_checkin_time" label="Preferred Check-in Time" />
    </VaCard>

    <!-- Food -->
    <VaCard class="block">
      <div class="blockTitle">Food</div>

      <div class="switchRow three">
        <div class="switchItem">
          <div class="switchLabel">Breakfast</div>
          <VaSwitch v-model="model.breakfast_included" />
        </div>
        <div class="switchItem">
          <div class="switchLabel">Vegetarian</div>
          <VaSwitch v-model="model.vegetarian" />
        </div>
        <div class="switchItem">
          <div class="switchLabel">Halal</div>
          <VaSwitch v-model="model.halal_food" />
        </div>
      </div>

      <VaInput v-model="model.allergies" label="Allergies" />
    </VaCard>

    <!-- Notes -->
    <VaCard class="block wide">
      <div class="blockTitle">Special Notes</div>
      <VaTextarea v-model="model.special_notes" :max-rows="3" label="Notes" />
      <div class="formActions">
        <VaButton preset="secondary" @click="$emit('cancel')">Cancel</VaButton>
        <VaButton color="success" icon="save" :disabled="!canSubmit" @click="submit">
          Save
        </VaButton>
      </div>
    </VaCard>
  </div>
</template>

<style scoped>
.formGrid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 860px){
  .formGrid{ grid-template-columns: 1fr; }
}
.block{
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 8px 20px rgba(15,23,42,.06);
  padding: 14px;
}
.wide{ grid-column: 1 / -1; }
.blockTitle{
  font-size: 12px;
  font-weight: 900;
  color:#0f172a;
  margin-bottom: 10px;
}

.switchRow{
  margin-top: 10px;
  border: 1px solid #eef2f6;
  background:#fbfcfe;
  border-radius: 14px;
  padding: 12px;
  display:grid;
  gap: 10px;
}
.switchRow.three{ grid-template-columns: 1fr 1fr 1fr; }
.switchRow.two{ grid-template-columns: 1fr 1fr; }
@media (max-width: 860px){
  .switchRow.three, .switchRow.two{ grid-template-columns: 1fr; }
}
.switchItem{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
}
.switchLabel{
  font-size: 12px;
  font-weight: 900;
  color:#334155;
}

.formActions{
  margin-top: 12px;
  display:flex;
  justify-content:flex-end;
  gap: 10px;
}
</style>
