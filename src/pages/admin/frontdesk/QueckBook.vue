<!-- src/pages/frontdesk/QuickBook.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 p-4 sm:p-6">
    <!-- Top -->
    <div class="mx-auto">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">flash_on</span>
            <h1 class="text-xl font-bold text-slate-900">Front Desk • Quick Booking</h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Walk-in / Phone / Other • Hourly or Nightly • Select multiple rooms • ABA KHQR / Cash
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            @click="saveDraft"
          >
            <span class="material-icons mr-1 text-[18px] align-middle">save</span>
            Save Draft
          </button>
          <button
            class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
            @click="confirmBooking"
            :disabled="selectedRooms.length === 0"
          >
            <span class="material-icons mr-1 text-[18px] align-middle">check_circle</span>
            Confirm
          </button>
        </div>
      </div>

      <!-- Main grid -->
      <div class="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]">
        <!-- Left -->
        <div class="space-y-6">
          <!-- Booking info -->
          <section class="rounded-2xl bg-white p-4 sm:p-5">
            <div class="flex items-center justify-between">
              <div class="text-sm font-extrabold text-slate-900">Booking Info</div>
              <div class="text-xs text-slate-500">
                {{ data.property.name }} • {{ data.property.city }}
              </div>
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div class="mb-2 text-xs font-bold text-slate-500">Booking source</div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in data.bookingSources"
                    :key="s.value"
                    class="rounded-full px-3 py-1.5 text-sm font-bold"
                    :class="draft.booking_source === s.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                    @click="draft.booking_source = s.value"
                  >
                    {{ s.label }}
                  </button>
                </div>
              </div>

              <div>
                <div class="mb-2 text-xs font-bold text-slate-500">Stay type</div>
                <div class="flex gap-2">
                  <button
                    class="flex-1 rounded-2xl px-3 py-2 text-sm font-extrabold"
                    :class="draft.booking_type === 'hourly' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                    @click="setBookingType('hourly')"
                  >
                    Hourly
                  </button>
                  <button
                    class="flex-1 rounded-2xl px-3 py-2 text-sm font-extrabold"
                    :class="draft.booking_type === 'nightly' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                    @click="setBookingType('nightly')"
                  >
                    Nightly
                  </button>
                </div>
              </div>
            </div>

            <!-- Hourly / Nightly controls -->
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <div v-if="draft.booking_type === 'hourly'">
                <div class="mb-2 text-xs font-bold text-slate-500">Hourly preset</div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="h in data.hourlyPresets"
                    :key="h.hours"
                    class="rounded-full px-3 py-1.5 text-sm font-bold"
                    :class="draft.hours === h.hours ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                    @click="setHours(h.hours)"
                  >
                    {{ h.label }}
                  </button>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div class="mb-1 text-xs font-bold text-slate-500">Check-in</div>
                    <input v-model="draft.check_in_at" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="YYYY-MM-DD HH:mm" />
                  </div>
                  <div>
                    <div class="mb-1 text-xs font-bold text-slate-500">Check-out</div>
                    <input v-model="draft.check_out_at" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="YYYY-MM-DD HH:mm" />
                  </div>
                </div>
              </div>

              <div v-else>
                <div class="mb-2 text-xs font-bold text-slate-500">Nights</div>
                <div class="flex items-center gap-2">
                  <button class="rounded-xl bg-slate-100 px-3 py-2 font-extrabold" @click="draft.nights = Math.max(1, draft.nights - 1)">-</button>
                  <div class="flex-1 rounded-2xl bg-slate-100 px-3 py-2 text-center text-sm font-extrabold text-slate-900">
                    {{ draft.nights }} night(s)
                  </div>
                  <button class="rounded-xl bg-slate-100 px-3 py-2 font-extrabold" @click="draft.nights = draft.nights + 1">+</button>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div class="mb-1 text-xs font-bold text-slate-500">Check-in date</div>
                    <input v-model="draft.check_in_date" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="YYYY-MM-DD" />
                  </div>
                  <div>
                    <div class="mb-1 text-xs font-bold text-slate-500">Check-out date</div>
                    <input v-model="draft.check_out_date" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="YYYY-MM-DD" />
                  </div>
                </div>
              </div>

              <!-- Guest -->
              <div>
                <div class="mb-2 flex items-center justify-between">
                  <div class="text-xs font-bold text-slate-500">Guest</div>
                  <div class="flex gap-2">
                    <button
                      class="rounded-full px-3 py-1 text-xs font-extrabold"
                      :class="draft.guest_mode === 'existing' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      @click="draft.guest_mode = 'existing'"
                    >
                      Existing
                    </button>
                    <button
                      class="rounded-full px-3 py-1 text-xs font-extrabold"
                      :class="draft.guest_mode === 'new' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      @click="draft.guest_mode = 'new'"
                    >
                      New
                    </button>
                  </div>
                </div>

                <div v-if="draft.guest_mode === 'existing'">
                  <div class="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
                    <span class="material-icons text-slate-500 text-[18px]">search</span>
                    <input
                      v-model.trim="guestQuery"
                      class="w-full bg-transparent text-sm outline-none"
                      placeholder="Search guest name / phone..."
                    />
                  </div>

                  <div class="mt-3 max-h-44 overflow-auto">
                    <button
                      v-for="g in filteredGuests"
                      :key="g.guest_id"
                      class="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left hover:bg-slate-100"
                      @click="selectGuest(g)"
                    >
                      <div>
                        <div class="text-sm font-bold text-slate-900">{{ g.name }}</div>
                        <div class="text-xs text-slate-500">{{ g.phone }} • {{ g.nationality }}</div>
                      </div>
                      <span v-if="selectedGuest?.guest_id === g.guest_id" class="material-icons text-emerald-600">check</span>
                    </button>
                  </div>
                </div>

                <div v-else class="grid gap-2">
                  <input v-model="draft.new_guest.name" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="Guest name" />
                  <input v-model="draft.new_guest.phone" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="Phone" />
                  <div class="grid grid-cols-2 gap-2">
                    <input v-model="draft.new_guest.nationality" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="Nationality" />
                    <input v-model="draft.new_guest.id_number" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="ID / Passport" />
                  </div>
                  <textarea v-model="draft.new_guest.notes" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" placeholder="Notes (optional)" rows="2"></textarea>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <div class="mb-2 text-xs font-bold text-slate-500">Notes</div>
                <textarea v-model="draft.notes" class="w-full rounded-2xl bg-slate-100 px-3 py-2 text-sm outline-none" rows="4" placeholder="Special request / staff note..."></textarea>
              </div>
            </div>
          </section>

          <!-- Room filters + list -->
          <section class="rounded-2xl bg-white p-4 sm:p-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div class="text-sm font-extrabold text-slate-900">Select Rooms</div>
                <div class="mt-1 text-xs text-slate-500">Choose room type (Simple/VIP) & beds. Pick multiple rooms.</div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  class="rounded-full px-3 py-1.5 text-xs font-extrabold"
                  :class="typeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  @click="typeFilter = 'all'"
                >
                  All
                </button>
                <button
                  class="rounded-full px-3 py-1.5 text-xs font-extrabold"
                  :class="typeFilter === 'Simple' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  @click="typeFilter = 'Simple'"
                >
                  Simple
                </button>
                <button
                  class="rounded-full px-3 py-1.5 text-xs font-extrabold"
                  :class="typeFilter === 'VIP' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  @click="typeFilter = 'VIP'"
                >
                  VIP
                </button>

                <button
                  class="rounded-full px-3 py-1.5 text-xs font-extrabold"
                  :class="bedFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  @click="bedFilter = 'all'"
                >
                  Any bed
                </button>
                <button
                  class="rounded-full px-3 py-1.5 text-xs font-extrabold"
                  :class="bedFilter === 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  @click="bedFilter = 1"
                >
                  1 bed
                </button>
                <button
                  class="rounded-full px-3 py-1.5 text-xs font-extrabold"
                  :class="bedFilter === 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                  @click="bedFilter = 2"
                >
                  2 beds
                </button>
              </div>
            </div>

            <!-- available rooms -->
            <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button
                v-for="r in filteredRooms"
                :key="r.room_id"
                class="rounded-2xl bg-slate-100 p-3 text-left hover:bg-slate-200"
                :class="isRoomSelected(r.room_id) ? 'ring-2 ring-emerald-500 bg-emerald-50 hover:bg-emerald-100' : ''"
                @click="toggleRoom(r)"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="text-sm font-extrabold text-slate-900">Room {{ r.room_number }}</div>
                    <div class="mt-1 text-xs text-slate-600">
                      Floor {{ r.floor }} • {{ r.type_group }} • {{ r.beds }} bed(s)
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-[10px] font-bold text-slate-500">{{ draft.booking_type === 'hourly' ? 'Per hour' : 'Per night' }}</div>
                    <div class="text-sm font-extrabold text-slate-900">{{ money(r.unit_price) }}</div>
                  </div>
                </div>

                <div class="mt-3 flex items-center justify-between">
                  <div class="text-xs font-bold text-slate-500">Qty</div>
                  <div class="flex items-center gap-2">
                    <button
                      class="rounded-lg bg-white px-2 py-1 text-sm font-extrabold text-slate-900"
                      @click.stop="decQty(r.room_id)"
                      :disabled="!isRoomSelected(r.room_id)"
                    >
                      -
                    </button>
                    <div class="min-w-[44px] text-center text-sm font-extrabold text-slate-900">
                      {{ qtyForRoom(r.room_id) }}
                    </div>
                    <button
                      class="rounded-lg bg-white px-2 py-1 text-sm font-extrabold text-slate-900"
                      @click.stop="incQty(r.room_id)"
                      :disabled="!isRoomSelected(r.room_id)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div class="mt-2 text-right text-xs font-bold text-slate-600">
                  Line total: <span class="text-slate-900">{{ money(lineTotalForRoom(r.room_id)) }}</span>
                </div>
              </button>
            </div>

            <div v-if="filteredRooms.length === 0" class="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
              No available rooms match the filters.
            </div>
          </section>

          <!-- Recent -->
          <section class="rounded-2xl bg-white p-4 sm:p-5">
            <div class="flex items-center justify-between">
              <div class="text-sm font-extrabold text-slate-900">Recent Quick Bookings</div>
              <button class="text-xs font-extrabold text-slate-700 hover:text-slate-900" @click="toast('Demo only')">
                View all
              </button>
            </div>

            <div class="mt-4 grid gap-3">
              <div
                v-for="b in data.recentQuickBooks"
                :key="b.booking_id"
                class="rounded-2xl bg-slate-100 p-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-extrabold text-slate-900">{{ b.booking_number }}</div>
                      <span class="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-700">
                        {{ pretty(b.booking_source) }}
                      </span>
                      <span class="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-700">
                        {{ pretty(b.stay.booking_type) }}
                      </span>
                    </div>
                    <div class="mt-1 text-xs text-slate-600">
                      {{ b.guest.name }} • {{ b.guest.phone }} • {{ b.created_at }}
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-[10px] font-bold text-slate-500">Total</div>
                    <div class="text-sm font-extrabold text-slate-900">{{ money(b.totals.total) }}</div>
                    <div class="mt-1 text-[10px] font-bold text-slate-600">
                      {{ b.payment.method }} • {{ pretty(b.payment.status) }}
                    </div>
                  </div>
                </div>

                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="rm in b.rooms"
                    :key="rm.room_id"
                    class="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-slate-700"
                  >
                    Room {{ rm.room_number }} • {{ rm.type_group }} {{ rm.beds }} bed •
                    {{ rm.qty }}{{ b.stay.booking_type === 'hourly' ? 'h' : 'n' }}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right -->
        <div class="space-y-4">
          <!-- Selected -->
          <aside class="rounded-2xl bg-white p-4 sm:p-5">
            <div class="flex items-center justify-between">
              <div class="text-sm font-extrabold text-slate-900">Summary</div>
              <button class="text-xs font-extrabold text-slate-700 hover:text-slate-900" @click="resetAll">
                Reset all
              </button>
            </div>

            <div class="mt-3 rounded-2xl bg-slate-100 p-3">
              <div class="text-[11px] font-extrabold text-slate-600">Guest</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">
                {{ guestLabel }}
              </div>
              <div class="mt-1 text-xs text-slate-600">
                {{ guestSub }}
              </div>
            </div>

            <div class="mt-3 rounded-2xl bg-slate-100 p-3">
              <div class="text-[11px] font-extrabold text-slate-600">Stay</div>
              <div class="mt-1 text-sm font-extrabold text-slate-900">
                {{ stayLabel }}
              </div>
              <div class="mt-1 text-xs text-slate-600">
                {{ staySub }}
              </div>
            </div>

            <div class="mt-3">
              <div class="text-xs font-extrabold text-slate-500">Selected rooms</div>

              <div v-if="selectedRooms.length === 0" class="mt-2 rounded-2xl bg-slate-100 p-3 text-sm text-slate-600">
                No rooms selected yet.
              </div>

              <div v-else class="mt-2 space-y-2">
                <div
                  v-for="it in selectedRooms"
                  :key="it.room_id"
                  class="rounded-2xl bg-slate-100 p-3"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="text-sm font-extrabold text-slate-900">Room {{ it.room_number }}</div>
                      <div class="text-xs text-slate-600">{{ it.type_group }} • {{ it.beds }} bed(s)</div>
                    </div>
                    <button class="rounded-full bg-white p-1" @click="removeRoom(it.room_id)">
                      <span class="material-icons text-slate-600 text-[18px]">close</span>
                    </button>
                  </div>

                  <div class="mt-2 flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Qty: <span class="text-slate-900">{{ it.qty }}</span></span>
                    <span>Line: <span class="text-slate-900">{{ money(it.total) }}</span></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pricing -->
            <div class="mt-4 rounded-2xl bg-slate-100 p-3">
              <div class="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Subtotal</span><span class="text-slate-900">{{ money(subtotal) }}</span>
              </div>

              <div class="mt-2 grid grid-cols-3 gap-2">
                <div class="col-span-1">
                  <div class="text-[11px] font-extrabold text-slate-600">Discount</div>
                  <input v-model.number="draft.pricing.discount" type="number" min="0" class="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm outline-none" />
                </div>
                <div class="col-span-1">
                  <div class="text-[11px] font-extrabold text-slate-600">Extra</div>
                  <input v-model.number="draft.pricing.extra" type="number" min="0" class="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm outline-none" />
                </div>
                <div class="col-span-1">
                  <div class="text-[11px] font-extrabold text-slate-600">Tax %</div>
                  <input v-model.number="draft.pricing.tax_rate" type="number" min="0" class="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm outline-none" />
                </div>
              </div>

              <div class="mt-3 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Tax</span><span class="text-slate-900">{{ money(taxAmount) }}</span>
              </div>
              <div class="mt-2 flex items-center justify-between text-sm font-extrabold text-slate-900">
                <span>Total</span><span>{{ money(grandTotal) }}</span>
              </div>
            </div>

            <!-- Deposit -->
            <div class="mt-4 rounded-2xl bg-slate-100 p-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs font-extrabold text-slate-600">Deposit</div>
                  <div class="text-[11px] text-slate-500">Optional for guesthouse</div>
                </div>
                <button
                  class="rounded-full px-3 py-1 text-xs font-extrabold"
                  :class="draft.deposit.enabled ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'"
                  @click="draft.deposit.enabled = !draft.deposit.enabled"
                >
                  {{ draft.deposit.enabled ? 'Enabled' : 'Off' }}
                </button>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2" v-if="draft.deposit.enabled">
                <div>
                  <div class="text-[11px] font-extrabold text-slate-600">Amount</div>
                  <input v-model.number="draft.deposit.amount" type="number" min="0" class="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <div class="text-[11px] font-extrabold text-slate-600">Paid?</div>
                  <button
                    class="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm font-extrabold"
                    :class="draft.deposit.paid ? 'text-emerald-700' : 'text-slate-700'"
                    @click="draft.deposit.paid = !draft.deposit.paid"
                  >
                    {{ draft.deposit.paid ? 'Yes' : 'No' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="mt-4 rounded-2xl bg-slate-100 p-3">
              <div class="text-xs font-extrabold text-slate-600">Payment</div>

              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="m in data.paymentMethods"
                  :key="m.code"
                  class="rounded-full px-3 py-1.5 text-xs font-extrabold"
                  :class="draft.payment.method_code === m.code ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'"
                  @click="draft.payment.method_code = m.code; draft.payment.currency = m.currency"
                >
                  {{ m.label }}
                </button>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <div class="text-[11px] font-extrabold text-slate-600">Paid amount</div>
                  <input
                    v-model.number="draft.payment.amount_paid"
                    type="number"
                    min="0"
                    class="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm outline-none"
                    :placeholder="draft.payment.currency"
                  />
                </div>
                <div>
                  <div class="text-[11px] font-extrabold text-slate-600">Status</div>
                  <div class="mt-1 flex gap-2">
                    <button
                      class="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-extrabold"
                      :class="draft.payment.status === 'pending' ? 'text-slate-900' : 'text-slate-500'"
                      @click="draft.payment.status = 'pending'"
                    >
                      Pending
                    </button>
                    <button
                      class="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-extrabold"
                      :class="draft.payment.status === 'completed' ? 'text-emerald-700' : 'text-slate-500'"
                      @click="draft.payment.status = 'completed'"
                    >
                      Paid
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-2">
                <div class="text-[11px] font-extrabold text-slate-600">Reference</div>
                <input v-model.trim="draft.payment.reference" class="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm outline-none" placeholder="KHQR ref / receipt no..." />
              </div>

              <div class="mt-3 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Balance</span>
                <span class="text-slate-900">{{ money(balance) }}</span>
              </div>

              <div v-if="draft.payment.method_code === 'ABA_KHQR'" class="mt-3 rounded-2xl bg-white p-3">
                <div class="text-[11px] font-extrabold text-slate-600">ABA KHQR (Demo)</div>
                <div class="mt-2 flex items-center gap-3">
                  <div class="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
                    <span class="material-icons text-slate-600">qr_code_2</span>
                  </div>
                  <div class="text-xs text-slate-600">
                    Show QR on screen for customer to scan.
                    <div class="mt-1 font-extrabold text-slate-900">{{ money(grandTotal) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom actions -->
            <div class="mt-4 grid gap-2">
              <button
                class="rounded-2xl bg-slate-900 py-3 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-50"
                :disabled="selectedRooms.length === 0"
                @click="confirmBooking"
              >
                Confirm Booking
              </button>
              <button class="rounded-2xl bg-slate-100 py-3 text-sm font-extrabold text-slate-900 hover:bg-slate-200" @click="printPreview">
                Print Preview
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toastState.show"
      class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-extrabold"
      :class="toastState.type === 'ok' ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'"
    >
      {{ toastState.msg }}
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue"
import { frontdeskQuickBookData as data } from "@/data/front/frontdeskQuickBook"

// -----------------------------
// State
// -----------------------------
const draft = reactive(structuredClone(data.draftQuickBook))
const guestQuery = ref("")
const typeFilter = ref("all") // all / Simple / VIP
const bedFilter = ref("all") // all / 1 / 2
const selectedGuest = ref(null)

const toastState = reactive({ show: false, msg: "", type: "ok", t: null })

// -----------------------------
// Helpers
// -----------------------------
const money = (n) => {
  const v = Number(n || 0)
  return `$${v.toFixed(2)}`
}
const pretty = (s) => String(s || "").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase())

function toast(msg, type = "ok") {
  toastState.show = true
  toastState.msg = msg
  toastState.type = type
  clearTimeout(toastState.t)
  toastState.t = setTimeout(() => (toastState.show = false), 1600)
}

function setBookingType(t) {
  draft.booking_type = t
  // reset room qty to match booking type default
  selectedRooms.value = selectedRooms.value.map((x) => ({
    ...x,
    qty: t === "hourly" ? draft.hours : draft.nights,
    total: (t === "hourly" ? draft.hours : draft.nights) * x.unit_price,
  }))
}

function setHours(h) {
  draft.hours = h
  if (draft.booking_type === "hourly") {
    // update selected rooms qty
    selectedRooms.value = selectedRooms.value.map((x) => ({ ...x, qty: h, total: h * x.unit_price }))
  }
}

// -----------------------------
// Guests
// -----------------------------
const filteredGuests = computed(() => {
  const k = guestQuery.value.trim().toLowerCase()
  if (!k) return data.guests
  return data.guests.filter((g) => {
    return (
      String(g.name).toLowerCase().includes(k) ||
      String(g.phone).toLowerCase().includes(k) ||
      String(g.guest_number || "").toLowerCase().includes(k)
    )
  })
})

function selectGuest(g) {
  selectedGuest.value = g
  draft.guest_id = g.guest_id
  toast(`Selected: ${g.name}`)
}

// -----------------------------
// Rooms mapping
// -----------------------------
const roomTypeMap = computed(() => {
  const m = new Map()
  data.roomTypes.forEach((t) => m.set(t.room_type_id, t))
  return m
})

const availableRooms = computed(() => {
  // only show available rooms in quick booking
  return data.rooms
    .filter((r) => r.status === "available")
    .map((r) => {
      const t = roomTypeMap.value.get(r.room_type_id)
      const unit_price = draft.booking_type === "hourly" ? t.price.hourly : t.price.nightly
      return {
        ...r,
        type_group: t.type_group,
        beds: t.beds,
        unit_price,
      }
    })
})

const filteredRooms = computed(() => {
  return availableRooms.value.filter((r) => {
    if (typeFilter.value !== "all" && r.type_group !== typeFilter.value) return false
    if (bedFilter.value !== "all" && r.beds !== bedFilter.value) return false
    return true
  })
})

// -----------------------------
// Selected rooms
// -----------------------------
const selectedRooms = ref([]) // {room_id, room_number, type_group, beds, unit_price, qty, total}

function isRoomSelected(room_id) {
  return selectedRooms.value.some((x) => x.room_id === room_id)
}

function defaultQty() {
  return draft.booking_type === "hourly" ? draft.hours : draft.nights
}

function toggleRoom(r) {
  if (isRoomSelected(r.room_id)) {
    removeRoom(r.room_id)
    return
  }
  const qty = defaultQty()
  selectedRooms.value.push({
    room_id: r.room_id,
    room_number: r.room_number,
    floor: r.floor,
    room_type_id: r.room_type_id,
    type_group: r.type_group,
    beds: r.beds,
    unit_price: r.unit_price,
    qty,
    total: qty * r.unit_price,
  })
  toast(`Added room ${r.room_number}`)
}

function removeRoom(room_id) {
  selectedRooms.value = selectedRooms.value.filter((x) => x.room_id !== room_id)
}

function qtyForRoom(room_id) {
  const it = selectedRooms.value.find((x) => x.room_id === room_id)
  return it ? it.qty : 0
}

function lineTotalForRoom(room_id) {
  const it = selectedRooms.value.find((x) => x.room_id === room_id)
  return it ? it.total : 0
}

function incQty(room_id) {
  const it = selectedRooms.value.find((x) => x.room_id === room_id)
  if (!it) return
  it.qty += 1
  it.total = it.qty * it.unit_price
  if (draft.booking_type === "hourly") draft.hours = it.qty
  else draft.nights = it.qty
}

function decQty(room_id) {
  const it = selectedRooms.value.find((x) => x.room_id === room_id)
  if (!it) return
  it.qty = Math.max(1, it.qty - 1)
  it.total = it.qty * it.unit_price
  if (draft.booking_type === "hourly") draft.hours = it.qty
  else draft.nights = it.qty
}

// -----------------------------
// Totals
// -----------------------------
const subtotal = computed(() => selectedRooms.value.reduce((a, x) => a + Number(x.total || 0), 0))
const taxAmount = computed(() => (subtotal.value - Number(draft.pricing.discount || 0) + Number(draft.pricing.extra || 0)) * (Number(draft.pricing.tax_rate || 0) / 100))
const grandTotal = computed(() => subtotal.value - Number(draft.pricing.discount || 0) + Number(draft.pricing.extra || 0) + taxAmount.value)
const balance = computed(() => Math.max(0, grandTotal.value - Number(draft.payment.amount_paid || 0)))

// Labels
const guestLabel = computed(() => {
  if (draft.guest_mode === "new") return draft.new_guest.name || "New guest (not filled)"
  return selectedGuest.value?.name || "No guest selected"
})
const guestSub = computed(() => {
  if (draft.guest_mode === "new") return draft.new_guest.phone || "Phone not set"
  return selectedGuest.value?.phone || "—"
})
const stayLabel = computed(() => (draft.booking_type === "hourly" ? `${draft.hours} hour(s)` : `${draft.nights} night(s)`))
const staySub = computed(() => {
  if (draft.booking_type === "hourly") return `${draft.check_in_at} → ${draft.check_out_at}`
  return `${draft.check_in_date} → ${draft.check_out_date}`
})

// -----------------------------
// Actions (demo only)
// -----------------------------
function resetAll() {
  const fresh = structuredClone(data.draftQuickBook)
  Object.keys(fresh).forEach((k) => (draft[k] = fresh[k]))
  selectedGuest.value = null
  selectedRooms.value = []
  guestQuery.value = ""
  typeFilter.value = "all"
  bedFilter.value = "all"
  toast("Reset done")
}

function saveDraft() {
  // demo: store local
  const payload = {
    ...structuredClone(draft),
    selectedRooms: structuredClone(selectedRooms.value),
    totals: { subtotal: subtotal.value, tax: taxAmount.value, total: grandTotal.value },
  }
  localStorage.setItem("quick_book_draft", JSON.stringify(payload))
  toast("Draft saved")
}

function confirmBooking() {
  if (selectedRooms.value.length === 0) return toast("Select at least 1 room", "err")
  if (draft.guest_mode === "existing" && !draft.guest_id) return toast("Select guest", "err")
  if (draft.guest_mode === "new" && (!draft.new_guest.name || !draft.new_guest.phone)) return toast("Fill guest name & phone", "err")
  toast("Confirmed (demo)")
  console.log("CONFIRM PAYLOAD:", {
    draft: structuredClone(draft),
    selectedRooms: structuredClone(selectedRooms.value),
    totals: { subtotal: subtotal.value, tax: taxAmount.value, total: grandTotal.value, balance: balance.value },
  })
}

function printPreview() {
  const guest = guestLabel.value

  const lines = selectedRooms.value
    .map(
      (x) =>
        `Room ${x.room_number} • ${x.type_group} ${x.beds} bed • ${x.qty}${
          draft.booking_type === "hourly" ? "h" : "n"
        } • ${money(x.total)}`
    )
    .join("<br/>")

  const w = window.open("", "_blank")
  if (!w) {
    alert("Popup blocked. Please allow popups for this site.")
    return
  }

  w.document.open()
  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Quick Booking Preview</title>
      </head>
      <body style="font-family: ui-sans-serif, system-ui; padding: 18px;">
        <h2 style="margin:0;">${data.property.name}</h2>
        <div style="color:#555; margin-top:6px;">Quick Booking Preview</div>
        <hr/>
        <div><b>Guest:</b> ${guest}</div>
        <div style="margin-top:6px;"><b>Stay:</b> ${stayLabel.value}</div>

        <div style="margin-top:12px;"><b>Rooms</b></div>
        <div style="margin-top:6px;">${lines || "-"}</div>

        <hr/>
        <div style="text-align:right;">
          <div>Subtotal: ${money(subtotal.value)}</div>
          <div>Tax: ${money(taxAmount.value)}</div>
          <div style="font-size:18px;"><b>Total: ${money(grandTotal.value)}</b></div>
          <div style="margin-top:6px;">Paid: ${money(draft.payment.amount_paid)}</div>
          <div><b>Balance: ${money(balance.value)}</b></div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        <\/script>
      </body>
    </html>
  `)
  w.document.close()
}

</script>