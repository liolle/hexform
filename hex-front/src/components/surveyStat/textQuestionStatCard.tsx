import { Component, For } from "solid-js";
import { TextStatConfig } from "~/types";

interface StatCardProps {
  config: string
  title: string

}

const TextStatCard: Component<StatCardProps> = (props) => {
  let config: TextStatConfig = {
    top_words: []
  }

  try {
    config = JSON.parse(props.config)
  } catch (error) {
  }


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
            <For each={config.top_words} >
              {
                (item, idex) => {
                  return (
                    <div class="w-32 h-12 border-1 rounded-[.5rem] p-1 border-base-100 flex justify-center items-center">
                      <span class="text-xs text-content opacity-60">{item}</span>
                    </div>
                  )
                }
              }
            </For>
          </div>
        </div>
      </div>


    </div>
  )
}

export default TextStatCard
