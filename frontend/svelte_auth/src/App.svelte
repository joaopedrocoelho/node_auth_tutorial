<script>
  import Login from "./pages/Login.svelte";
  import Register from "./pages/Register.svelte";
  import Home from "./pages/Home.svelte";
  import Router from "svelte-spa-router";
  import Forgot from "./pages/Forgot.svelte";

  import Nav from "./components/Nav.svelte";
  import Reset from "./pages/Reset.svelte";

  const routes = {
    "/": Home,
    "/login": Login,
    "/register": Register,
    "/forgot": Forgot,
    "/reset/:token": Reset
  };

 

</script>

<Nav />

<Router {routes} />
