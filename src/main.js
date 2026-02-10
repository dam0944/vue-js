import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import vuetify from './plugins/vuetify'

import { createVuestic } from "vuestic-ui"
import "vuestic-ui/styles/essential.css"
import "vuestic-ui/styles/typography.css"

import "./assets/main.css"
import { initI18n } from "./i18n";
async function setupApp() {
  await initI18n();
}

await setupApp();
createApp(App)
  .use(router)
  .use(vuetify)
  .use(
    createVuestic({ 
      config: {
        colors: {
          variables: {
            primary: "#0ea5e9",  
            success: "#10b981",
            warning: "#f59e0b",
            danger: "#ef4444",
          },
        },
      },
    })
  )
  .mount("#app")
