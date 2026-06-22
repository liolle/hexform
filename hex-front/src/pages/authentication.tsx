import { useNavigate, useParams } from "@solidjs/router";
import localforage from "localforage";
import { Component, createSignal, createEffect } from "solid-js";
import LoginForm from "~/components/forms/loginFrom";
import RegisterForm from "~/components/forms/registerForm";
import AppState from "~/state/state";


export enum AuthPageType {
  Login,
  Register
}

export interface AuthPageParam {
  pageType: AuthPageType
}

export const [subpage, setsubpage] = createSignal<AuthPageType>(AuthPageType.Login);

const AuthPage: Component = () => {
  const params = useParams();

  const navigate = useNavigate()




  switch (params.subpage) {
    case "login":
      setsubpage(AuthPageType.Login)

      break;

    case "register":
      setsubpage(AuthPageType.Register)
      break;
    default:
      setsubpage(AuthPageType.Login)

  }

  createEffect(async () => {
    if (AppState.connected) {
      navigate('/home', { replace: true });
    }
  });



  return (
    <div class="h-screen bg-base-300 flex ">
      <div role="tablist" class="tabs tabs-lift mt-[calc(50vh-300px)] ml-[calc(50vw-150px)]">
        {/* Tab 1 */}
        <input
          type="radio"
          name="my_tabs_3"
          class="tab ml-4"
          aria-label="Login"
          checked={subpage() == AuthPageType.Login}
          onClick={() => setsubpage(AuthPageType.Login)}
        />
        <div class="tab-content">
          <LoginForm />
        </div>

        {/* Tab 2 */}
        <input
          type="radio"
          name="my_tabs_3"
          class="tab"
          aria-label="Register"
          checked={subpage() == AuthPageType.Register}
          onClick={() => setsubpage(AuthPageType.Register)}
        />
        <div class="tab-content">
          <RegisterForm />
        </div>

      </div>
    </div>)
}

export default AuthPage
