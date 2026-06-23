import { useNavigate } from "@solidjs/router";
import { Component, createEffect } from "solid-js";


const LandingPage: Component = () => {
  const navigate = useNavigate()

  createEffect(() => {
    navigate('/home', { replace: true });
  });

  return (
    <div class="h-screen bg-base-300 flex justify-center items-center ">
    </div>

  )

}

export default LandingPage
