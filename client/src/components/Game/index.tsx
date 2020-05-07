/// <reference types="webrtc" />

import React, {Component} from 'react';
import './Game.scss';

import Video from '../Video';
import CanvasOverlay from '../CanvasOverlay';

import {Coords, Direction} from '../../utils/types';

import CoordsConversion from '../../utils/coordsConversion';
import HitDetection from '../../utils/hitDetection';

// this component will store coords in terms of a normalized format
// and should pass it to the canvas in that normalized format

interface State {
  pendingHostCoords: Coords,
  hostCoords: Coords,
  ballCoords: Coords,
  ballVel: Coords,
}

class Game extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      pendingHostCoords: {x: 0, y: 0},
      hostCoords: {x: 0, y: 0},
      ballCoords: {x: 400, y: 50},
      ballVel: {x: 10, y: 10},
    }
    this.tick = this.tick.bind(this);
    this.updateHostCoords = this.updateHostCoords.bind(this);
  }

  componentDidMount() {
    requestAnimationFrame(this.tick);
  }

  tick() {
    let newBallCoords = this.state.ballCoords;
    newBallCoords.x += this.state.ballVel.x;
    newBallCoords.y += this.state.ballVel.y;
    let ballVelocity = this.state.ballVel;

    //check for ball wall hits
    let hit: Direction = HitDetection.checkWalls(newBallCoords);
    if(hit === "top") {
      ballVelocity.y *= -1;
      newBallCoords.y *= -1;
    }
    if(hit === "bottom") {
      ballVelocity.y *= -1;
      newBallCoords.y = (1000 - (newBallCoords.y - 1000));
    }
    if(hit === "left") {
      ballVelocity.x *= -1;
      newBallCoords.x *= -1;
    }
    if(hit === "right") {
      ballVelocity.x *= -1;
      newBallCoords.x = (1000 - (newBallCoords.x - 1000));
    }


    this.setState({
      hostCoords: this.state.pendingHostCoords,
      ballCoords: newBallCoords,
      ballVel: ballVelocity,
    });
    requestAnimationFrame(this.tick)
  }

  updateHostCoords(coords : Coords) {
    // the host coords should only take up the left half of the screen
    coords.x /= 2;
    this.setState({pendingHostCoords: CoordsConversion.centerCoords(coords)});
  }

  render() {
    return (
      <div className="game-outer">
        <CanvasOverlay hostCoords={this.state.hostCoords} ballCoords={this.state.ballCoords}></CanvasOverlay>
        <Video updateCoords={this.updateHostCoords}></Video>
      </div>
    )
  }
}

export default Game