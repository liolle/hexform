import { FiGithub } from "solid-icons/fi"
import { createSignal, Switch, Match } from "solid-js"
import AppState from "~/state/state"
import { HomeTabType, Store } from "~/state/store"


const Sidebar = () => {

  return (
    <div class="w-[256px] p-4 h-full py-[20px] flex flex-col justify-between  border-r border-base-100">
      <div class="flex flex-col gap-4">
        <SidebarButton tab={HomeTabType.DASHBOARD} />
        <SidebarButton tab={HomeTabType.SURVEYS} />
      </div>
      <button
        onclick={() => open("https://github.com/liolle/hexform")}
        class="btn btn-secondary btn-dash rounded-[.5rem] w-fit flex gap-4 justify-start items-center select-none text-content">
        <FiGithub />
        <span class="text-md italic opacity-60">
          hexform
        </span>
      </button>
    </div>
  )
}

interface SidebarButtonProps {
  tab: HomeTabType
}


const SidebarButton = (props: SidebarButtonProps) => {

  const handleClick = () => {
    switch (props.tab) {
      case HomeTabType.DASHBOARD:
        AppState.activeHomeTab = HomeTabType.DASHBOARD
        break;

      case HomeTabType.SURVEYS:
        AppState.activeHomeTab = HomeTabType.SURVEYS
        break;

      default:
        break;
    }

  }

  return (
    <button class="btn btn-ghost w-full  hover:bg-base-100 flex justify-start border-1 border-base-100 rounded-[.25rem]"
      style={{
        background: Store.activeHomeTab == props.tab ? "var(--color-base-100)" : "transparent"
      }}
      onclick={handleClick}>
      <Switch >
        <Match when={props.tab == HomeTabType.DASHBOARD}>
          <span>Dashboard</span>
        </Match>

        <Match when={props.tab == HomeTabType.SURVEYS}>
          <span>Surveys</span>
        </Match>
      </Switch>

    </button>
  )
}

export default Sidebar
