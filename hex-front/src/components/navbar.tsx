import { useNavigate } from "@solidjs/router";
import { Component } from "solid-js";
import { AuthS } from "~/services/services";


const Navbar: Component = () => {

  const navigate = useNavigate()

  const handleLogout = async () => {
    await AuthS.logout()
    navigate("/auth", { replace: true })
  }

  return (
    <div class="navbar bg-transparent border-b border-base-100  shadow-sm w-screen">
      <div class="navbar-start">
      </div>
      <div class="navbar-end">
        <button
          onclick={handleLogout}
          class="btn btn-soft rounded-[.5rem] bg-base-100 ">Logout
        </button>
      </div>
    </div>

  )
}

export default Navbar
