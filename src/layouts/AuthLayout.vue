<template>
  <div class="login-page" :class="{ 'font-kh': isKhFont }">
    <div class="login-grid">
      <!-- LEFT -->
      <section class="login-left">
        <VaCarousel
          :key="lang"
          v-model="slide"
          :items="slides"
          autoscroll
          :autoscroll-interval="4500"
          infinite
          class="left-carousel"
        >
          <template #default="{ item }">
            <div class="slide" :style="{ backgroundImage: `url(${item.image})` }">
              <div class="overlay"></div>

              <div class="left-content">
                <h1>{{ item.title }}</h1>
                <p>{{ item.desc }}</p>

                <ul class="features">
                  <li v-for="(f, i) in item.features" :key="i">
                    <VaIcon name="check_circle" size="18px" />
                    <span>{{ f }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </VaCarousel>
      </section>

      <!-- RIGHT -->
      <section class="login-right">
        <!-- TOP RIGHT TOOLS -->
        <div class="top-tools">
          <LanguageSwitcher />

          <VaButton
            preset="secondary"
            size="small"
            class="font-btn"
            type="button"
            @click="toggleFont"
            :aria-label="isKhFont ? 'Switch to English font' : 'Switch to Khmer font'"
          >
            {{ isKhFont ? 'EN' : 'ខ្មែរ' }}
          </VaButton>
        </div>

        <div class="right-shell">
          <router-view />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { t, lang } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";

const slide = ref(0);

// ---------- Font toggle ----------
const FONT_STORAGE_KEY = "login_font";
const isKhFont = ref(false);

const toggleFont = () => {
  isKhFont.value = !isKhFont.value;
  localStorage.setItem(FONT_STORAGE_KEY, isKhFont.value ? "kh" : "en");
};

onMounted(() => {
  isKhFont.value = (localStorage.getItem(FONT_STORAGE_KEY) || "en") === "kh";
});

watch(lang, (v) => {
  slide.value = 0;
});

// ---------- Slides ----------
const slideImages = [
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
  "https://i.pinimg.com/1200x/6b/3c/a8/6b3ca8d736b9a67d5d65773d72cd0665.jpg",
  "https://i.pinimg.com/1200x/95/e0/be/95e0beb9a7842457203d1b77b3836b5d.jpg",
];

const slides = computed(() => {
  const data = t("loginLeft.slides", { returnObjects: true }) || [];

  if (!Array.isArray(data) || data.length === 0) {
    return [
      {
        image: slideImages[0],
        title: "Guesthouse Management",
        desc: "Manage rooms, guests, billing and housekeeping easily.",
        features: ["Room status workflow", "Reservations calendar", "Guest history"],
      },
    ];
  }

  return data.map((s, index) => ({
    image: slideImages[index] || slideImages[0],
    title: s.title || "",
    desc: s.desc || "",
    features: Array.isArray(s.features) ? s.features : [],
  }));
});
</script>

<style scoped>
/* Default font (English) */
.login-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: Inter, system-ui, sans-serif;
  background: #fff;
}

/* Khmer font toggle */
.login-page.font-kh {
  font-family: "Noto Sans Khmer", "Khmer OS System", system-ui, sans-serif;
}

/* GRID */
.login-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  height: 100%;
}

.login-left {
  height: 100%;
  display: flex;
  overflow: hidden;
}

.left-carousel {
  flex: 1;
  height: 100%;
  min-height: 100%;
}

:deep(.va-carousel),
:deep(.va-carousel__wrapper),
:deep(.va-carousel__container),
:deep(.va-carousel__content),
:deep(.va-carousel__items),
:deep(.va-carousel__item),
:deep(.va-carousel__slides) {
  height: 100% !important;
  min-height: 100% !important;
}

/* Hide carousel indicators (1, 2, 3 numbers) */
:deep(.va-carousel__indicators) {
  display: none !important;
}

/* Slide */
.slide {
  height: 100%;
  width: 100%;
  position: relative;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-end;
  padding: 48px;
  color: #fff;
  box-sizing: border-box;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(68, 158, 199, 0.85), rgba(2, 132, 199, 0.45));
}

.left-content {
  position: relative;
  z-index: 2;
  max-width: 520px;
}

.left-content h1 {
  font-size: clamp(28px, 3.5vw, 36px);
  font-weight: 900;
  margin: 0 0 10px;
  line-height: 1.2;
}

.left-content p {
  margin: 0 0 14px;
  opacity: 0.92;
  line-height: 1.6;
  font-size: clamp(14px, 1.5vw, 16px);
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.features li {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: clamp(13px, 1.4vw, 15px);
}

/* RIGHT */
.login-right {
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 32px;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;
}

/* Top right area */
.top-tools {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 10;
}

.font-btn {
  font-weight: 800;
  min-width: 48px;
  height: 36px;
}

.right-shell {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

/* TABLET LANDSCAPE (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .login-grid {
    grid-template-columns: 1fr 1fr;
  }

  .login-left {
    height: 100%;
  }

  .slide {
    padding: 36px;
  }

  .left-content {
    max-width: 420px;
  }

  .login-right {
    padding: 48px 40px;
  }

  .right-shell {
    max-width: 460px;
  }

  .top-tools {
    top: 16px;
    right: 16px;
  }
}

/* TABLET PORTRAIT (600px - 767px) */
@media (min-width: 600px) and (max-width: 767px) {
  .login-grid {
    grid-template-columns: 1fr;
  }

  .login-left {
    height: 320px;
  }

  .slide {
    align-items: center;
    padding: 32px;
  }

  .left-content h1 {
    font-size: 26px;
  }

  .login-right {
    padding: 72px 48px 32px;
    justify-content: flex-start;
  }

  .right-shell {
    max-width: 480px;
  }

  .top-tools {
    top: 16px;
    right: 16px;
  }
}

/* MOBILE (below 600px) */
@media (max-width: 599px) {
  .login-grid {
    grid-template-columns: 1fr;
  }

  .login-left {
    height: 260px;
  }

  .slide {
    align-items: center;
    padding: 28px;
  }

  .left-content h1 {
    font-size: 24px;
  }

  .left-content p {
    font-size: 14px;
  }

  .features li {
    font-size: 13px;
  }

  .login-right {
    padding: 68px 20px 24px;
    justify-content: flex-start;
  }

  .right-shell {
    max-width: 100%;
  }

  .top-tools {
    top: 12px;
    right: 12px;
  }

  .font-btn {
    min-width: 44px;
    height: 32px;
    font-size: 12px;
  }
}

/* VERY SMALL MOBILE (below 400px) */
@media (max-width: 399px) {
  .login-left {
    height: 220px;
  }

  .slide {
    padding: 20px;
  }

  .left-content h1 {
    font-size: 20px;
  }

  .login-right {
    padding: 64px 16px 20px;
  }
}
</style>