import { SurveyData } from "~/services/surveyService"
import { For, Match, Setter, Switch } from "solid-js"
import { Store } from "~/state/store"
import AppState from "~/state/state"
import { SurveyQuestion, SurveyQuestionType } from "~/types"
import { IoTrashBinOutline } from "solid-icons/io"

interface SurveyEditorProps {
  survey: SurveyData | undefined
}

const deleteQuestion = (surveyId: string, questionId: string) => {
  AppState.removeSurveyQuestion(surveyId, questionId)
}

interface QuestionCardProps {
  surveyId: string,
  question: SurveyQuestion,
}

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

const QuestionCard = (props: QuestionCardProps) => {

  return (
    <div>
      <Switch>
        <Match when={props.question.type == SurveyQuestionType.TEXT}>
          <TextQuestionCard surveyId={props.surveyId} question={props.question} />
        </Match>
        <Match when={props.question.type == SurveyQuestionType.BOOL}>
          <BoolQuestionCard surveyId={props.surveyId} question={props.question} />
        </Match>

        <Match when={props.question.type == SurveyQuestionType.NUMBER}>
          <NumberQuestionCard surveyId={props.surveyId} question={props.question} />
        </Match>

        <Match when={props.question.type == SurveyQuestionType.RATING}>
          <RatingQuestionCard surveyId={props.surveyId} question={props.question} />
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

  let question = AppState.surveyQuestions[props.surveyId].find(v => v.id == props.question.id)
  let q: SurveyQuestion = question ?? props.question

  const debouncedSave = debounce(() => {
    AppState.upsertSurveyQuestion(props.surveyId, props.question.id, q, false);
  }, 500);

  const handleInput = (e: InputEvent) => {

    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    switch (target.name) {
      case "title":
        q.title = newValue
        break;

      default:
        break;
    }

    debouncedSave();
  }

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
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8" onclick={() => deleteQuestion(props.surveyId, props.question.id)}>
          <IoTrashBinOutline />
        </button>
      </div>

    </div>
  )

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

interface RatingConfig {
  max: number
}

const RatingQuestionCard = (props: QuestionCardProps) => {

  let question = AppState.surveyQuestions[props.surveyId].find(v => v.id == props.question.id)
  let q: SurveyQuestion = question ?? props.question
  let config: RatingConfig = q.config ? JSON.parse(q.config) : {};

  const debouncedSave = debounce(() => {
    AppState.upsertSurveyQuestion(props.surveyId, props.question.id, q, false);
  }, 500);


  const handleInput = (e: InputEvent) => {

    const target = e.target as HTMLInputElement;
    const newValue = target.value;

    try {
      switch (target.name) {
        case "title":
          q.title = newValue
          break;
        case "max":
          config.max = newValue == "" ? 5 : parseInt(newValue)
          q.config = JSON.stringify(config)
          break;

        default:
          break;
      }

    } catch (error) {

    }

    debouncedSave();
  }

  return (
    <div class=" border-b-2 rounded-[.25rem] p-2 border-base-100 flex flex-col gap-2">
      <div>
        <span class="text-xs text-content italic font-bold">Rating</span>
      </div>
      <input
        type="text"
        name="title"
        value={question?.title ?? ""}
        class="input rounded-[.5rem] focus:outline-0"
        required={true}
        onInput={handleInput}
        placeholder={"Question ?"} />

      <div class="flex justify-between">
        <div>
          <fieldset class="fieldset  flex gap-[2rem] ">

            <input
              type="number"
              name="max"
              value={config?.max ?? ""}
              class="input rounded-[.5rem] focus:outline-0 w-24"
              required={true}
              onkeydown={AllowDigitOnly}
              onInput={handleInput}
              placeholder={"max"} />
          </fieldset>

        </div>
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8 place-self-end" onclick={() => deleteQuestion(props.surveyId, props.question.id)}>
          <IoTrashBinOutline />
        </button>
      </div>
    </div>
  )
}

interface NumberConfig {
  min: number
  max: number
}

const NumberQuestionCard = (props: QuestionCardProps) => {

  let question = AppState.surveyQuestions[props.surveyId].find(v => v.id == props.question.id)
  let q: SurveyQuestion = question ?? props.question
  let config: NumberConfig = q.config ? JSON.parse(q.config) : {};

  const debouncedSave = debounce(() => {
    AppState.upsertSurveyQuestion(props.surveyId, props.question.id, q, false);
  }, 500);


  const handleInput = (e: InputEvent) => {

    const target = e.target as HTMLInputElement;
    const newValue = target.value;

    try {
      switch (target.name) {
        case "title":
          q.title = newValue
          break;
        case "max":
          config.max = newValue == "" ? 0 : parseInt(newValue)
          q.config = JSON.stringify(config)
          break;

        case "min":
          config.min = newValue == "" ? 0 : parseInt(newValue)
          q.config = JSON.stringify(config)
          break;


        default:
          break;
      }

    } catch (error) {

    }

    debouncedSave();
  }


  return (
    <div class=" border-b-2 rounded-[.25rem] p-2 border-base-100 flex flex-col gap-2">
      <div>
        <span class="text-xs text-content italic font-bold">Number</span>
      </div>
      <input
        type="text"
        name="title"
        value={question?.title ?? ""}
        class="input rounded-[.5rem] focus:outline-0"
        required={true}
        onInput={handleInput}
        placeholder={"Question ?"} />

      <div class="flex justify-between">
        <div>
          <fieldset class="fieldset  flex gap-[2rem] ">
            <input
              type="number"
              name="min"
              value={config?.min ?? ""}
              class="input rounded-[.5rem] focus:outline-0 w-24"
              onkeydown={AllowDigitOnly}
              required={true}
              onInput={handleInput}
              placeholder={"min"} />

            <input
              type="number"
              name="max"
              value={config?.max ?? ""}
              class="input rounded-[.5rem] focus:outline-0 w-24"
              required={true}
              onkeydown={AllowDigitOnly}
              onInput={handleInput}
              placeholder={"max"} />

          </fieldset>

        </div>
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8 place-self-end" onclick={() => deleteQuestion(props.surveyId, props.question.id)}>
          <IoTrashBinOutline />
        </button>
      </div>

    </div>
  )
}

interface BoolConfig {
  trueLabel: string
  falseLabel: string
}

const BoolQuestionCard = (props: QuestionCardProps) => {

  let question = AppState.surveyQuestions[props.surveyId].find(v => v.id == props.question.id)
  let q: SurveyQuestion = question ?? props.question
  let config: BoolConfig = q.config ? JSON.parse(q.config) : {};

  const debouncedSave = debounce(() => {
    AppState.upsertSurveyQuestion(props.surveyId, props.question.id, q, false);
  }, 500);


  const handleInput = (e: InputEvent) => {

    const target = e.target as HTMLInputElement;
    const newValue = target.value;

    try {
      switch (target.name) {
        case "title":
          q.title = newValue
          break;
        case "trueLabel":
          config.trueLabel = newValue
          q.config = JSON.stringify(config)
          break;

        case "falseLabel":
          config.falseLabel = newValue
          q.config = JSON.stringify(config)
          break;
      }

    } catch (error) {

    }

    debouncedSave();
  }


  return (
    <div class=" border-b-2 rounded-[.25rem] p-2 border-base-100 flex flex-col gap-2">
      <div>
        <span class="text-xs text-content italic font-bold">Boolean</span>
      </div>
      <input
        type="text"
        name="title"
        class="input rounded-[.5rem] focus:outline-0"
        value={question?.title ?? ""}
        onInput={handleInput}
        required={true}
        placeholder={"Question ?"} />

      <div class="flex justify-between">
        <div>
          <fieldset class="fieldset  flex gap-[2rem] ">
            <input
              type="text"
              name="trueLabel"
              class="input rounded-[.5rem] focus:outline-0 w-36"
              value={config?.trueLabel ?? ""}
              onInput={handleInput}
              required={true}
              placeholder={"True lable"} />

            <input
              type="text"
              name="falseLabel"
              class="input rounded-[.5rem] focus:outline-0 w-36"
              value={config?.falseLabel ?? ""}
              required={true}
              onInput={handleInput}
              placeholder={"False label"} />

          </fieldset>

        </div>
        <button class="btn btn-outline btn-error rounded-[.5rem] p-0 w-8 h-8 place-self-end" onclick={() => deleteQuestion(props.surveyId, props.question.id)}>
          <IoTrashBinOutline />
        </button>
      </div>

    </div>
  )
}

export default SurveyEditor
