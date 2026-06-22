import { Component, Suspense } from 'solid-js';
import { storeReady } from './state/store';

interface AppProps {
  children?: any;
}

const App: Component = (props: AppProps) => {

  return (

    <Suspense fallback={<div>Loading your data...</div>}>
      {storeReady() && props.children}
    </Suspense>


  );
};

export default App;
