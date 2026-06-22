

import { Component, createEffect, createSignal, For } from "solid-js";
import { RatingStatConfig } from "~/types";

interface StatCardProps {
  config: string
  title: string

}
const RatingStatCard: Component<StatCardProps> = (props) => {
  const [config, setConfig] = createSignal<RatingStatConfig>({
    max: 2,
    avg: 2,
    std: 0
  });

  const [items, setItems] = createSignal<any[]>([]);

  createEffect(() => {
    try {
      let conf: RatingStatConfig = JSON.parse(props.config);
      setItems(Array.from({ length: conf.max }));
      setConfig(conf)
    } catch (error) {
      console.error("Failed to parse config:", error);
    }
  });



  // Helper to determine if a star should be checked
  const isStarChecked = (index: number, half: 'p1' | 'p2') => {
    const mean = config().avg;
    const pos = index + (half === "p1" ? 0.5 : 1);

    if (half === 'p1') {
      return mean >= pos;
    } else {
      return mean >= pos && mean <= pos + 0.5;
    }
  };

  // Helper to get star value
  const getStarValue = (index: number, half: 'p1' | 'p2') => {
    return `${half}:${index + 1}`;
  };

  return (
    <div class="relative h-36 border-base-100 border-b-1 rounded-[0.5rem] select-none">
      <div class="flex flex-col gap-2">
        <div class="flex justify-start h-12">
          <span class="text-content text-md italic font-bold">
            {props.title}
          </span>
        </div>

        <div class="h-[100px] flex flex-col gap-2">
          <div class="rating rating-lg rating-half flex">
            <For each={items()}>
              {(_, index) => {
                const idx = index(); // Get the actual index value
                return (
                  <>
                    <input
                      disabled
                      type="radio"
                      name="rating"
                      checked={isStarChecked(idx, 'p1')}
                      value={getStarValue(idx, 'p1')}
                      class="mask mask-star-2 mask-half-1 bg-primary mk"
                    />
                    <input
                      disabled
                      type="radio"
                      name="rating"
                      checked={isStarChecked(idx, 'p2')}
                      value={getStarValue(idx, 'p2')}
                      class="mask mask-star-2 mask-half-2 bg-primary mk"
                    />
                  </>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingStatCard 
