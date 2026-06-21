
import { Component, createSignal, onMount } from "solid-js";
import { BoolStatConfig } from "~/types";

interface StatCardProps {
  config: string
  title: string

}

const BooleanStatCard: Component<StatCardProps> = (props) => {

  const [trueValue, setTrueValue] = createSignal(40)

  let config: BoolStatConfig = {
    true_count: 0,
    false_count: 0,
    trueLabel: "True",
    falseLabel: "False"
  }


  onMount(() => {
    try {
      config = JSON.parse(props.config)

      let total = config.true_count + config.false_count

      let truePer = total == 0 ? 50 : Math.round(config.true_count * 100 / total)
      setTrueValue(truePer)

    } catch (error) { }

  })


  return (
    <div class="relative h-36 border-base-100 border-b-1 rounded-[0.5rem] select-none    ">
      <div class="flex flex-col gap-2">
        <div class="flex justify-start h-12 ">
          <span class="text-content text-md italic font-bold">
            {props.title}
          </span>
        </div>

        <div class="flex  h-24 flex items-center max-w-[calc(100vw-360px)] overflow-auto  ">
          <div class=" flex gap-2 p-1">

            <div class={`w-32 h-16 border-1 rounded-[.5rem] p-1 border-base-100 flex flex-col justify-center items-center outline-primary ${trueValue() > 50 ? "outline-1" : ""}`}>
              <span class="text-xs text-content opacity-60">{config.trueLabel}</span>
              <span class="text-xs text-content font-bold">{`${trueValue()}%`}</span>
            </div>

            <div class={`w-32 h-16 border-1 rounded-[.5rem] p-1 border-base-100 flex flex-col justify-center items-center outline-primary ${trueValue() < 50 ? "outline-1" : ""}`}>
              <span class="text-xs text-content opacity-60">{config.falseLabel}</span>
              <span class="text-xs text-content font-bold ">{`${100 - trueValue()}%`}</span>
            </div>


          </div>
        </div>
      </div>


    </div>
  )
}

export default BooleanStatCard 
