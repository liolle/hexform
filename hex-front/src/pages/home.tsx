import { useNavigate } from "@solidjs/router";
import { Component, createEffect } from "solid-js";
import Navbar from "~/components/navbar";
import AppState from "~/state/state";

const HomePage: Component = () => {
  const navigate = useNavigate()

  createEffect(() => {
    if (!AppState.connected) {

      navigate('/auth', { replace: true });

    }
  });

  return (
    <div class="h-screen bg-base-300 flex justify-center items-center flex gap-1  ">
      <div class="absolute stiky top-0">
        <Navbar />
      </div>
      <span class="text-xl text-primary font-bold">
        Home page
      </span>
    </div>

  )
}

export default HomePage
