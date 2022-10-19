<script>
  import axios from "axios";
  import { authenticated } from "../../store/auth";
  import { push } from "svelte-spa-router";

  let code = "";

  export let loginData = {};

  $: submit = async () => {
    console.log('loginData', loginData);
    try{
        const { data } = await axios.post(
      "two-factor",
      {
        ...loginData,
        code,
      },
      { withCredentials: true }
    );

    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${data.accessToken}`;

    authenticated.set(true);

    await push("/");
    } catch (e) {
        console.log(e)
    }
   
  };
</script>

<form on:submit={submit}>
  <h1 class="h3 mb-3 fw-normal">Please insert your authenticator code</h1>

  <div class="form-floating">
    <input
      bind:value={code}
      type="text"
      class="form-control"
      id="floatingInput"
      placeholder="6 digit code"
    />
    <label for="floatingInput">Authenticator Code</label>
  </div>

  <button class="w-100 btn btn-lg btn-primary mt-3" type="submit"
    >Sign in</button
  >
</form>
