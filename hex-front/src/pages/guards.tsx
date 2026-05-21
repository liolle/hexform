import { RouteSectionProps, useNavigate } from "@solidjs/router";
import { Component, createEffect } from "solid-js";
import AppState from "~/state/state";
import AuthPage from "./authentication";

interface AuthGuardProps {
  children: Component
}


export const AuthGuard: Component = (props) => {
  const navigate = useNavigate();

  createEffect(() => {
    if (!AppState.connected) {
      navigate('/auth', { replace: true });
    }
  });

  return <></>;
}
