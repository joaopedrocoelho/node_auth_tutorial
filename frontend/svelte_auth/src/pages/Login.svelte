<script lang="ts">
  import axios from "axios";
  import { push } from "svelte-spa-router";

  let email = '';
  let password = '';
 

  $: submit = async () => {
      const { data } = await axios.post('login', {
          email,
          password,
      }, {withCredentials: true})

      console.log(data)


      axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
      await push('/')
  }

</script>

<main class="form-signin w-100 m-auto">
    <form on:submit={submit}>
      <h1 class="h3 mb-3 fw-normal">Please sign in</h1>
  
      <div class="form-floating">
        <input bind:value={email} type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
        <label for="floatingInput">Email address</label>
      </div>
      <div class="form-floating">
        <input bind:value={password} type="password" class="form-control" id="floatingPassword" placeholder="Password">
        <label for="floatingPassword">Password</label>
      </div>
  
      <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
    </form>
  </main>