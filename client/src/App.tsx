import React from 'react';
import './App.css';
import Video from './components/Video'

function App() {
  console.log("working");
  return (
    <div className="App">
      <div className="background">
        <Video></Video>
      </div>
      <header className="App-header">
      </header>
    </div>
  );
}

export default App;
