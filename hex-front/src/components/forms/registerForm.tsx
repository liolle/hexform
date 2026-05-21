import { reload, useLocation, useNavigate } from "@solidjs/router";
import { Component, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import z from "zod";
import { AuthS } from "~/services/services";

const [errors, setErrors] = createStore({ username: "", password: "", email: "", nickname: "" });

const Schema = z.object({
  username: z.string()
    .min(5, "username must be at least 5 characters"),

  nickname: z.string()
    .min(5, "username must be at least 5 characters"),

  password: z.string()
    .min(5, "password must be at least 5 characters")
    .refine((pwd) => /[A-Za-z]/.test(pwd), "Must contain at least one letter")
    .refine((pwd) => /\d/.test(pwd), "Must contain at least one number")
    .refine((pwd) => /[@$!%*#?&-+=:]/.test(pwd), "Must contain at least one special character (@$!%*#?&)-+=:"),

  email: z.nullable(z.email().optional())
})


const RegisterForm: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    let data = {
      username: formData.get("username")?.toString() ?? "",
      nickname: formData.get("nickname")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? undefined,
    }

    setErrors("username", "")
    setErrors("password", "")
    setErrors("nickname", "")
    setErrors("email", "")

    try {
      let output = Schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues;

        for (const issue of error.issues) {
          let key = issue.path[0].toString()
          switch (key) {
            case "username":
              setErrors("username", `${issue.message}`)
              break;
            case "password":
              setErrors("password", `${issue.message}`)
              break;

            case "nickname":
              setErrors("nickname", `${issue.message}`)
              break;
            case "email":
              setErrors("email", `${issue.message}`)
              break;

          }
        }
      }
    }



    let response = await AuthS.register(data)

    switch (response.result.status) {
      case 200:
      case 201:
        navigate("/home", { replace: true })

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
          <FormInput type="nickname" name="nickname" placeholder="Nickname" required={true} />
          <FormInput type="password" name="password" placeholder="Password" required={true} />
          <FormInput type="email" name="email" placeholder="Email" required={false} />
        </div>
        <button class="btn btn-neutral">Register</button>
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
        <Match when={props.name == "nickname"}>
          <span class="text-error text-xs font-bold h-[2rem] overflow-hidden">
            {errors.nickname}
          </span>
        </Match>
        <Match when={props.name == "password"}>
          <span class="text-error text-xs font-bold h-[2rem] overflow-hidden">
            {errors.password}
          </span>
        </Match>
        <Match when={props.name == "email"}>
          <span class="text-error text-xs font-bold h-[2rem] overflow-hidden">
            {errors.email}
          </span>
        </Match>
      </Switch>

    </div>


  );
};



export default RegisterForm
