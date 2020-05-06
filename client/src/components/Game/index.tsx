/// <reference types="webrtc" />

import React, {Component} from 'react';
import './Game.scss';

import Video from '../Video';
import CanvasOverlay from '../CanvasOverlay';

import {Coords} from '../../utils/types';

import CoordsConversion from '../../utils/coordsConversion';

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
      ballCoords: {x: 50, y: 50},
      ballVel: {x: 10, y: 10},
    }
    this.tick = this.tick.bind(this);
    this.updateCoords = this.updateCoords.bind(this);
  }

  componentDidMount() {
    requestAnimationFrame(this.tick);
  }

  tick() {
    let ballCoords = this.state.ballCoords;
    ballCoords.x += this.state.ballVel.x;
    ballCoords.y += this.state.ballVel.y;

    this.setState({
      hostCoords: this.state.pendingHostCoords,
      ballCoords: ballCoords
    });
    requestAnimationFrame(this.tick)
  }

  updateCoords(coords : Coords) {
    this.setState({pendingHostCoords: CoordsConversion.centerCoords(coords)});
  }

  render() {
    return (
      <div className="game-outer">
        <CanvasOverlay hostCoords={this.state.hostCoords} ballCoords={this.state.ballCoords}></CanvasOverlay>
        <Video updateCoords={this.updateCoords}></Video>
      </div>
    )
  }
}

export default Game