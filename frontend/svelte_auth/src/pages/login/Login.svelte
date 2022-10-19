<script lang="ts">
  import AuthenticatorForm from "./AuthenticatorForm.svelte";
  import LoginForm from "./LoginForm.svelte";
  import qrcode from "qrcode";

  interface detail {
    id: number;
    secret: string;
    otpauth_url: string;
  }

  interface userResponse {
    id: number,
    otpauth_url?: string,
    secret?: string,
  }

  let loginData:userResponse = {
    id: 0,
  };

  let src ='';

  $: login = (event: CustomEvent<detail>) => {
    loginData = event.detail;
    console.log(loginData);
    if(loginData.otpauth_url) {
      qrcode.toDataURL(loginData.otpauth_url, (err, data) => {
        if(err) {
          console.log(err);
        }
        else {
          src = data;
        }
      });
    }
  };
</script>

<main class="form-signin w-100 m-auto">
  {#if loginData.id === 0}
    <LoginForm on:login={login} />
  {:else}
    <AuthenticatorForm {loginData} />

    {#if src !== ''}
      <img {src} alt="QR Code" class="w-100" />
    {/if}
  {/if}
</main>
