/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import 'solid-devtools';
import { Router, Route } from "@solidjs/router"
import App from './App';
import { lazy } from 'solid-js';

const root = document.getElementById('root');


if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const routes = [
  {
    path: "/", component: lazy(() => import("@pages/landing"))
  },
  {
    path: "/auth/:subpage?", component: lazy(() => import("@pages/authentication"))
  },
  {
    path: "/preview/:id?", component: lazy(() => import("@pages/preview"))
  },
  {
    path: "/home", component: lazy(() => import("@pages/home"))
  },
  {
    path: "*", component: lazy(() => import("@pages/landing"))
  }
]

render(() => (
  <Router root={App}>
    {routes}
  </Router>
), root!);
