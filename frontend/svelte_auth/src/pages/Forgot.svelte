<script>
    import axios from 'axios';
    let email = '',
    cls = '',
    message = ';';

$: submit = async () => {
     const {status} = await axios.post('forgot', {
        email,
    })

    if (status=== 200) {
        cls = 'success';
        message = 'Check your email';
    } else {
        cls = 'danger';
        message = 'Something went wrong';
    }
}
</script>

<main class="form-signin w-100 m-auto">
    {#if cls}
        <div class={`alert alert-${cls}`} role='alert'>
            {message}
        </div>

    {/if}
    
  <form on:submit={submit}>
    <h1 class="h3 mb-3 fw-normal">Please sign in</h1>

    <div class="form-floating">
      <input
        bind:value={email}
        type="email"
        class="form-control"
        id="floatingInput"
        placeholder="name@example.com"
      />
      <label for="floatingInput">Email address</label>
    </div>

    <button class="w-100 btn btn-lg btn-primary mt-3" type="submit"
      >Sign in</button
    >
  </form>
</main>
