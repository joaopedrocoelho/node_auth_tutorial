<script lang="ts">
    import axios from "axios";
    import { link } from "svelte-spa-router";
    import { createEventDispatcher} from 'svelte';

  
    let email = '';
    let password = '';

    const dispatch = createEventDispatcher();
   
  
    $: submit = async () => {
        const { data } = await axios.post('login', {
            email,
            password,
        })

        dispatch('login', data);

    }
  
  </script>
  
  
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
        
        <div class="mb-3">
          <a href="/forgot" use:link>Forgot</a>
        </div>
    
        <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
      </form>
