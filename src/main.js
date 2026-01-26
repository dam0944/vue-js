import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"

import { createVuestic } from "vuestic-ui"
import "vuestic-ui/styles/essential.css"
import "vuestic-ui/styles/typography.css"

import "./assets/main.css"

createApp(App)
  .use(router)
  .use(createVuestic())
  .mount("#app")
  