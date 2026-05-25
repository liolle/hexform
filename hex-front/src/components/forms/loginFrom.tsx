import { useNavigate } from "@solidjs/router";
import { Component, createSelector, createSignal, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { AuthS } from "~/services/services";
import AppState from "~/state/state";


const [errors, setErrors] = createStore({ username: "", password: "" });

const LoginForm: Component = () => {
  const navigate = useNavigate()

  const handleSubmit = async (e: Event) => {

    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    let data = {
      username: formData.get("username")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? ""
    }

    let response = await AuthS.login(data)

    switch (response.result.status) {
      case 200:
        let token = response.result.content.get("token")
        if (!token) {
          return
        }
        AppState.accessToken = token
        AppState.connected = true
        navigate('/home', { replace: true });
        break;

      default:
        console.log(response)
        break;
    }

  };

  return (
    <form onsubmit={handleSubmit} >
      <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-xs p-4 flex flex-col gap-[2rem] ">


        <div class="flex flex-col gap-1">
          <FormInput type="username" name="username" placeholder="Username" required={true} />
          <FormInput type="password" name="password" placeholder="Password" required={true} />
        </div>

        <button class="btn btn-neutral">Login</button>

      </fieldset>
    </form>
  )
}


export interface FormInputType {
  type: string
  name: string
  required: boolean
  placeholder: string
}

const FormInput = (props: FormInputType) => {

  return (
    <div class="flex flex-col gap-1">
      <input
        type={props.type}
        name={props.name}
        class="input"
        required={props.required}
        placeholder={props.placeholder} />

      <Switch>
        <Match when={props.name == "username"}>
          <span class="text-error text-xs font-bold h-[2rem] overflow-hidden">
            {errors.username}
          </span>
        </Match>
        <Match when={props.name == "password"}>
          <span class="text-error text-xs font-bold h-[2rem] overflow-hidden">
            {errors.password}
          </span>
        </Match>
      </Switch>
    </div>
  );
};


export default LoginForm
