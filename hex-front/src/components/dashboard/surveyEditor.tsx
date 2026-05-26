import { SurveyData } from "~/services/surveyService"
import { createEffect, createSignal, For, Match, Setter, Switch } from "solid-js"
import { Store } from "~/state/store"
import AppState from "~/state/state"
import { SurveyQuestion, SurveyQuestionType } from "~/types"
import { IoTrashBinOutline } from "solid-icons/io"
import { createStore } from "solid-js/store"
import { title } from "node:process"
import { boolean } from "zod"

interface SurveyEditorProps {
  survey: SurveyData | undefined
}

let focusedElement: HTMLInputElement | undefined

const SurveyEditor = (props: SurveyEditorProps) => {

  let survey = props.survey

  if (!survey) {
    return (
      <div class="flex justify-center items-center">
        <span class="text-sm text-content">Invalid survey</span>
      </div>
    )
  }



  return (
    <div class="flex flex-col gap-4 relative overflow-y-auto" >

      <div class="max-h-[700px]">
        <For each={Store.surveyQuestions[survey.id]}>
          {(item, index) =>
            <QuestionCard surveyId={survey.id} question={item} />
          }
        </For>
      </div>

    </div>
  )
}


interface QuestionCardProps {
  surveyId: string,
  question: SurveyQuestion,
  questionSetter?: Setter<SurveyQuestion[]>
}

const QuestionCard = (props: QuestionCardProps) => {

  return (
    <div>
      <Switch>
        <Match when={props.question.type == SurveyQuestionType.TEXT}>
          <TextQuestionCard surveyId={props.surveyId} question={props.question} questionSetter={props.questionSetter} />
        </Match>
        <Match when={props.question.type == SurveyQuestionType.BOOL}>
          <BoolQuestionCard surveyId={props.surveyId} question={props.question} questionSetter={props.questionSetter} />
        </Match>

        <Match when={props.question.type == SurveyQuestionType.NUMBER}>
          <NumberQuestionCard surveyId={props.surveyId} question={props.question} questionSetter={props.questionSetter} />
        </Match>

        <Match when={props.question.type == SurveyQuestionType.RATING}>
          <RatingQuestionCard surveyId={props.surveyId} question={props.question} questionSetter={props.questionSetter} />
        </Match>
      </Switch>
    </div>
  )

}

const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const TextQuestionCard = (props: QuestionCardProps) => {

  const debouncedSave = debounce((question: SurveyQuestion) => {
    AppState.upsertSurveyQuestion(props.surveyId, props.question.id, question, false);
  }, 500);

  const handleInput = (e: InputEvent) => {

    const target = e.target as HTMLInputElement;
    const newValue = target.value;

    debouncedSave({ ...props.question, ...{ [target.name]: newValue } }, target);
  }

  const deleteQuestion = () => {
    AppState.removeSurveyQuestion(props.surveyId, props.question.id)
  }

  let question = AppState.surveyQuestions[props.surveyId].find(v => v.id == props.question.id)

  return (
    <div class=" border-b-2 rounded-[.25rem] p-2 border-base-100 flex flex-col gap-2">
      <div>
        <span class="text-xs text-content italic font-bold">Text</span>
      </div>
      <input
        type="text"
        name="title"
        value={question?.title ?? ""}
        class="input rounded-[.5rem] focus:outline-0"
        required={true}
        onInput={handleInput}
        placeholder={"Question ?"} />
      <div class="flex justify-end">
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8" onclick={deleteQuestion}>
          <IoTrashBinOutline />
        </button>
      </div>

    </div>
  )

}

const RatingQuestionCard = (props: QuestionCardProps) => {

  const deleteQuestion = () => {
    AppState.removeSurveyQuestion(props.surveyId, props.question.id)
  }

  const AllowDigitOnly = (e: KeyboardEvent) => {

    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }

    // Allow: numbers
    if (/^[0-9]$/.test(e.key)) {
      return;
    }


    // Block everything else
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }

  }


  return (
    <div class=" border-b-2 rounded-[.25rem] p-2 border-base-100 flex flex-col gap-2">
      <div>
        <span class="text-xs text-content italic font-bold">Rating</span>
      </div>
      <input
        type="text"
        name=""
        class="input rounded-[.5rem] focus:outline-0"
        required={true}
        placeholder={"Question ?"} />

      <div class="flex justify-between">
        <div>
          <fieldset class="fieldset  flex gap-[2rem] ">

            <input
              type="number"
              name=""
              class="input rounded-[.5rem] focus:outline-0 w-24"
              required={true}
              onkeydown={AllowDigitOnly}
              placeholder={"max"} />
          </fieldset>

        </div>
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8 place-self-end" onclick={deleteQuestion}>
          <IoTrashBinOutline />
        </button>
      </div>

    </div>
  )
}

const NumberQuestionCard = (props: QuestionCardProps) => {

  const deleteQuestion = () => {
    AppState.removeSurveyQuestion(props.surveyId, props.question.id)
  }

  const AllowDigitOnly = (e: KeyboardEvent) => {

    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }

    // Allow: numbers
    if (/^[0-9]$/.test(e.key)) {
      return;
    }

    // Block everything else
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  }


  return (
    <div class=" border-b-2 rounded-[.25rem] p-2 border-base-100 flex flex-col gap-2">
      <div>
        <span class="text-xs text-content italic font-bold">Number</span>
      </div>
      <input
        type="text"
        name=""
        class="input rounded-[.5rem] focus:outline-0"
        required={true}
        placeholder={"Question ?"} />

      <div class="flex justify-between">
        <div>
          <fieldset class="fieldset  flex gap-[2rem] ">
            <input
              type="number"
              name=""
              class="input rounded-[.5rem] focus:outline-0 w-24"
              required={true}
              placeholder={"min"} />

            <input
              type="number"
              name=""
              class="input rounded-[.5rem] focus:outline-0 w-24"
              required={true}
              onkeydown={AllowDigitOnly}
              placeholder={"max"} />

          </fieldset>

        </div>
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8 place-self-end" onclick={deleteQuestion}>
          <IoTrashBinOutline />
        </button>
      </div>

    </div>
  )
}

const BoolQuestionCard = (props: QuestionCardProps) => {

  const deleteQuestion = () => {
    AppState.removeSurveyQuestion(props.surveyId, props.question.id)
  }


  return (
    <div class=" border-b-2 rounded-[.25rem] p-2 border-base-100 flex flex-col gap-2">
      <div>
        <span class="text-xs text-content italic font-bold">Boolean</span>
      </div>
      <input
        type="text"
        name=""
        class="input rounded-[.5rem] focus:outline-0"
        required={true}
        placeholder={"Question ?"} />

      <div class="flex justify-between">
        <div>
          <fieldset class="fieldset  flex gap-[2rem] ">
            <input
              type="text"
              name=""
              class="input rounded-[.5rem] focus:outline-0 w-36"
              required={true}
              placeholder={"True lable"} />

            <input
              type="text"
              name=""
              class="input rounded-[.5rem] focus:outline-0 w-36"
              required={true}
              placeholder={"False label"} />

          </fieldset>


        </div>
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8 place-self-end" onclick={deleteQuestion}>
          <IoTrashBinOutline />
        </button>
      </div>

    </div>
  )
}

export default SurveyEditor
