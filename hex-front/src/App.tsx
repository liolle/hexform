import { onMount, Component } from 'solid-js';
import AppState from './state/state';

interface AppProps {
  children?: any;  // or more specific: children?: JSX.Element
}

const App: Component = (props: AppProps) => {

  //console.log(AppState.connected)


  return (

    <>
      {props.children}
    </>

  );
};

export default App;
