import { useNavigate } from "@solidjs/router";
import { Component } from "solid-js";
import { AuthS } from "~/services/services";


const Navbar: Component = () => {

  const navigate = useNavigate()

  const handleLogout = async () => {
    await AuthS.logout()
    navigate("/", { replace: true })
  }

  return (
    <div class="navbar bg-base-100 shadow-sm w-screen">
      <div class="navbar-start">
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li><a>Item 1</a></li>
          <li>
            <details>
              <summary>Parent</summary>
              <ul class="p-2 bg-base-100 w-40 z-1">
                <li><a>Submenu 1</a></li>
                <li><a>Submenu 2</a></li>
              </ul>
            </details>
          </li>
          <li><a>Item 3</a></li>
        </ul>
      </div>
      <div class="navbar-end">
        <button
          onclick={handleLogout}
          class="btn btn-soft ">Logout</button>
      </div>
    </div>

  )
}

export default Navbar
