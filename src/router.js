import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Dashboard from "./views/Dashboard.vue";

import AxiosTest from "./axios-test/AxiosTest.vue";


const routes = [
  {
    path: "/",
    redirect: "/login", // when the user visits the root path, redirect to /login
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true }, // this route requires authentication
  },

  // add this inside your routes array
{
  path: "/axios-test",
  component: AxiosTest,
}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


// Navigation guard to check for authentication before accessing protected routes
router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem("isLoggedIn");
    
    if (to.meta.requiresAuth && !isLoggedIn) {
 // If the route requires authentication and the user is not logged in, redirect to the login page
        next("/login");
    } else if (to.path === "/login" && isLoggedIn) {
// If the user is already logged in and tries to access the login page, redirect to the dashboard
        next("/dashboard");
    } else {
        next(); // Otherwise, allow the navigation to proceed
    }
});

export default router;