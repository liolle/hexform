import type { Component } from 'solid-js';
import AppState from './state/state';

const App: Component = () => {

  //console.log(AppState.connected)

  return (
    <div class="h-screen bg-green-500 flex justify-center items-center ">
      <p class="text-4xl text-green-700 text-center py-20">Hello tailwind!</p>
    </div>
  );
};

export default App;
