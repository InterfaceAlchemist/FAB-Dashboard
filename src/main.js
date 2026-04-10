import { createApp } from "vue";
import App from "./App.vue";
import router from "./router.js"; // import the router we created
import "./style.css";

const app = createApp(App);

app.use(router); // tell Vue to use the router

app.mount("#app");