<script>
    import axios from "axios";
    import { push } from "svelte-spa-router";

    export let params;

    let password = '';
    let password_confirm = '';

    $: submit = async () => {
        await axios.post('reset', {
            token: params.token,
            password,
            password_confirm
        })

        await push('/login')
    }

</script>

<main class="form-signin w-100 m-auto">
    <form on:submit|preventDefault={submit}>
      <h1 class="h3 mb-3 fw-normal">Reset Password</h1>
  
      <div class="form-floating">
        <input 
        bind:value={password}
        type="password" 
        class="form-control" 
        placeholder="Password"
        id="password">
        <label for="password">Password</label>
      </div>

      <div class="form-floating">
        <input 
        bind:value={password_confirm}
        type="password" 
        class="form-control" 
        placeholder="Confirm Password"
        id="passwordCofirm">
        <label for="passwordCofirm">Confirm Password</label>
      </div>
  
      <button class="w-100 btn btn-lg btn-primary" type="submit">Submit</button>
    </form>
  </main>