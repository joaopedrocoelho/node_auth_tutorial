<script>
    import axios from "axios";
    import { push } from "svelte-spa-router";

    let first_name = '';
    let last_name = '';
    let email = '';
    let password = '';
    let password_confirm = '';

    $: submit = async () => {
        await axios.post('http://localhost:8000/api/register', {
            first_name,
            last_name,
            email,
            password,
            password_confirm
        })

        await push('/login')
    }

</script>

<main class="form-signin w-100 m-auto">
    <form on:submit|preventDefault={submit}>
      <h1 class="h3 mb-3 fw-normal">Register</h1>
  
      <div class="form-floating">
        <input bind:value={first_name} 
        type="text" 
        class="form-control" 
        id="firstName" 
        placeholder="First Name">
        <label for="firstName">First name</label>
      </div>

      <div class="form-floating">
        <input 
        bind:value={last_name}
        type="text" 
        class="form-control"
        id="lastName"  
        placeholder="Last Name">
        <label for="lastName">Last name</label>
      </div>

      <div class="form-floating">
        <input 
        bind:value={email}
        type="email" 
        class="form-control"  
        placeholder="name@example.com"
        id="email">
        <label for="email">Email address</label>
      </div> 
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