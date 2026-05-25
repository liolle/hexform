import { useNavigate } from "@solidjs/router";
import { Component, createEffect, Switch, Match } from "solid-js";
import { unwrap } from "solid-js/store";
import Dashboard from "~/components/dashboard";
import Navbar from "~/components/navbar";
import Sidebar from "~/components/sidebar";
import Surveys from "~/components/surveys";
import { HomeTabType, Store } from "~/state/store";

const HomePage: Component = () => {
  const navigate = useNavigate()

  createEffect(() => {
    if (!Store.user) {
      navigate('/auth', { replace: true });
    }
  });

  return (
    <div class="h-screen bg-base-300 flex flex-col">
      <div class="">
        <Navbar />
      </div>
      <div class="flex-1 flex ">
        <div class="">
          <Sidebar />
        </div>
        <Switch>
          <Match when={Store.activeHomeTab == HomeTabType.DASHBOARD}>
            <Dashboard />
          </Match>

          <Match when={Store.activeHomeTab == HomeTabType.SURVEYS}>
            <Surveys />
          </Match>
        </Switch>
      </div>
    </div>

  )
}

export default HomePage
