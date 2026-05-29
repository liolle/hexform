import { Component, Match, Switch } from "solid-js"
import { createStore } from "solid-js/store";
import z from "zod";
import { SurveyS } from "~/services/surveyService";
import AppState from "~/state/state";

const [errors, setErrors] = createStore({ title: "", description: "", is_public: "" });

const Schema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters"),

  description: z.string(),
  is_public: z.boolean()

})


const CreateSurveyDialog: Component = () => {

  let formRef: HTMLFormElement | undefined
  let sending = false

  const closeSurveyModal = () => {
    let dialog = document.getElementById('create_survey_modal') as HTMLDialogElement
    if (!dialog) {
      return
    }

    dialog.close()
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (sending) {
      return
    }


    sending = true

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    let data = {
      title: formData.get("title")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      is_public: formData.get("is_public") == "on" ? true : false
    }

    setErrors("title", "")
    setErrors("description", "")

    try {
      let output = Schema.parse(data)

      formRef?.reset()
      await SurveyS.createSurvey(data)
      AppState.updateDashboardSurveys()
      closeSurveyModal()

    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues;

        for (const issue of error.issues) {
          let key = issue.path[0].toString()
          switch (key) {
            case "title":
              setErrors("title", `${issue.message}`)
              break;
            case "description":
              setErrors("description", `${issue.message}`)
              break;
          }
        }
      }

    }
    finally {
      sending = false
    }

  }


  return (
    <dialog id="create_survey_modal" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box relative">
        <button class="btn btn-outline rounded-full btn-error rounded-[.5rem] absolute p-0 w-8 h-8 top-1 right-1" onclick={closeSurveyModal}>
          <span class="text-xs">X</span>
        </button>
        <form ref={formRef} onsubmit={handleSubmit} >
          <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full p-4 flex flex-col gap-[2rem] ">
            <div class="flex flex-col gap-4">
              <FormInput type="text" placeholder="Tile" required={true} name="title" class="input rounded-[.5rem] focus:outline-0" />
              <FormInput type="text" placeholder="Description" required={false} name="description" class="input rounded-[.5rem] focus:outline-0" />
              <div class="flex gap-2 items-center">
                <span class="text-sm italic text-content">Public</span>
                <FormInput type="checkbox" placeholder="" required={false} name="is_public" class="toggle toggle-primary" />
              </div>
            </div>
            <div>
              <button class="btn btn-primary rounded-[.5rem]">Create</button>
            </div>
          </fieldset>
        </form>
      </div>
    </dialog>
  )
}


interface FormInputType {
  type: string
  name: string
  required: boolean
  placeholder: string
  class: string
}

const FormInput = (props: FormInputType = {
  type: "text",
  name: "",
  required: false,
  placeholder: "",
  class: ""
}) => {

  return (
    <div class="flex flex-col gap-1">
      <input
        type={props.type}
        name={props.name}
        class={props.class}
        required={props.required}
        placeholder={props.placeholder} />

      <Switch>
        <Match when={props.name == "title"}>
          <span class="text-error text-xs font-bold h-[2rem] overflow-hidden">
            {errors.title}
          </span>
        </Match>
        <Match when={props.name == "description"}>
          <span class="text-error text-xs font-bold h-[2rem] overflow-hidden">
            {errors.description}
          </span>
        </Match>
      </Switch>

    </div>


  );
};


export default CreateSurveyDialog
