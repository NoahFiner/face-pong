import React from 'react';
import './App.css';
import Video from './components/Video'

function App() {
  console.log("working");
  return (
    <div className="App">
      <header className="App-header">
        <Video></Video>
      </header>
    </div>
  );
}

export default App;
