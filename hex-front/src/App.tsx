import { Component, Suspense } from 'solid-js';
import { storeReady } from './state/store';
import { Toaster } from 'solid-toast';

interface AppProps {
  children?: any;
}

const App: Component = (props: AppProps) => {

  return (

    <Suspense fallback={<div>Loading your data...</div>}>
      {storeReady() && (
        <>
          {props.children}
          <Toaster />
        </>
      )}
    </Suspense>


  );
};

export default App;
