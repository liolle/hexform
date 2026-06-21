import { Component, createEffect, createSignal, For } from "solid-js";
import { NumberStatConfig, RatingStatConfig } from "~/types";

interface StatCardProps {
  config: string
  title: string

}
const NumberStatCard: Component<StatCardProps> = (props) => {
  const [config, setConfig] = createSignal<NumberStatConfig>({
    max: 2,
    min: 2,
    avg: 2,
    std: 0
  });


  createEffect(() => {
    try {
      let conf: NumberStatConfig = JSON.parse(props.config);
      setConfig(conf)
    } catch (error) {
      console.error("Failed to parse config:", error);
    }
  });




  return (
    <div class="relative h-36 border-base-100 border-b-1 rounded-[0.5rem] select-none">
      <div class="flex flex-col gap-2">
        <div class="flex justify-start h-12">
          <span class="text-content text-md italic font-bold">
            {props.title}
          </span>
        </div>

        <div class="h-[100px] flex flex-col gap-2">
          <div class=" flex gap-2 p-1">

            <div class={`w-32 h-16 border-1 rounded-[.5rem] p-1 border-base-100 flex flex-col justify-center items-center `}>
              <span class="text-xs text-content opacity-60">Min</span>
              <span class="text-xs text-content font-bold">{config().min}</span>
            </div>

            <div class={`w-32 h-16 border-1 rounded-[.5rem] p-1 border-base-100 flex flex-col justify-center items-center outline-primary `}>
              <span class="text-xs text-content opacity-60">Max</span>
              <span class="text-xs text-content font-bold">{config().max}</span>
            </div>

            <div class={`w-32 h-16 border-1 rounded-[.5rem] p-1 border-base-100 flex flex-col justify-center items-center outline-primary `}>
              <span class="text-xs text-content opacity-60">Avegare</span>
              <span class="text-xs text-content font-bold">{config().avg}</span>
            </div>



          </div>

        </div>
      </div>
    </div>
  );
};

export default NumberStatCard 
