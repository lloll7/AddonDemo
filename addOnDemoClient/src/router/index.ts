import { createRouter, createWebHistory } from "vue-router";
import eweAddOnView from "@/views/eweAddOnView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: eweAddOnView,
    },
  ],
});

export default router;
