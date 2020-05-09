/// <reference types="webrtc" />

import React, {Component} from 'react';
import './Game.scss';

import Video from '../Video';
import CanvasOverlay from '../CanvasOverlay';

import {Coords, Direction, Dimensions} from '../../utils/types';

import CoordsConversion from '../../utils/coordsConversion';
import HitDetection from '../../utils/hitDetection';
import { PADDLE_DIMS, BALL_RADIUS, BALL_SPEED, BALL_HIT_TIMEOUT_X, BALL_HIT_TIMEOUT_Y, MAX_BALL_SPEED } from '../../utils/constants';

// this component will store coords in terms of a normalized format
// and should pass it to the canvas in that normalized format

interface State {
  pendingHostCoords: Coords,
  hostCoords: Coords,
  ballCoords: Coords,
  ballVelocity: Coords,
  timeSinceLastHit: Coords,
  hostHit: boolean,
  dims: Dimensions,
}

class Game extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      pendingHostCoords: {x: 0, y: 0},
      hostCoords: {x: 0, y: 0},
      ballCoords: {x: 500, y: 50},
      ballVelocity: BALL_SPEED,
      timeSinceLastHit: {x: 0, y: 0},
      hostHit: false,
      dims: {width: 0, height: 0}
    }
    this.tick = this.tick.bind(this);
    this.updateHostCoords = this.updateHostCoords.bind(this);
    this.updateDimensions =this.updateDimensions.bind(this);
  }

  updateDimensions() {
    // we'll make the game 95% of the smallest axis
    // we need a 2:3 ratio (or a 1:1.5 ratio) of the height to the width
    let coords = {width: window.innerWidth*.95, height: window.innerHeight*.95}
    if(coords.width > coords.height*1.5) {
      coords.width = coords.height*1.5;
    } else {
      coords.height = coords.width*(2/3);
    }
    this.setState({
      dims: coords
    });
  }

  componentDidMount() {
    this.updateDimensions();
    requestAnimationFrame(this.tick);

    window.addEventListener('resize', this.updateDimensions);

  }

  tick() {
    let newBallCoords = {...this.state.ballCoords};
    newBallCoords.x += this.state.ballVelocity.x;
    newBallCoords.y += this.state.ballVelocity.y;
    let ballVelocity = {...this.state.ballVelocity};

    let timeSinceLastHit = {...this.state.timeSinceLastHit};

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
      newBallCoords.x = (1500 - (newBallCoords.x - 1500));
    }

    let hostHit: boolean = HitDetection.checkBallRectangle(
      this.state.hostCoords,
      PADDLE_DIMS,
      newBallCoords,
      BALL_RADIUS,
    )

    // to avoid the ball getting hit too many times
    timeSinceLastHit.x++;
    timeSinceLastHit.y++;

    this.setState({hostHit});

    if(hostHit) {
      // if the ball is between the x bounds of the host paddle
      if(this.state.hostCoords.x <= newBallCoords.x && newBallCoords.x <= this.state.hostCoords.x + PADDLE_DIMS.width && timeSinceLastHit.y > BALL_HIT_TIMEOUT_Y) {
        // if the ball is higher than the center of the paddle, this must be a hit from the top
        if(newBallCoords.y <= this.state.hostCoords.y + PADDLE_DIMS.height/2) {
          console.log("TOP");
          ballVelocity.y *= -1;
          timeSinceLastHit.y = 0;
          // otherwise, this must be from the bottom
        } else {
          console.log("BOTTOM");
          ballVelocity.y *= -1;
          timeSinceLastHit.y = 0;
        }
        // otherwise, if it within the y bounds, this is either a left or right hit
      } else if (this.state.hostCoords.y <= newBallCoords.y && newBallCoords.y <= this.state.hostCoords.y + PADDLE_DIMS.height && timeSinceLastHit.x > BALL_HIT_TIMEOUT_X) {
        if(newBallCoords.y <= this.state.hostCoords.y + PADDLE_DIMS.height/2) {
          console.log("RIGHT");
          ballVelocity.x *= -1;
          timeSinceLastHit.x = 0;
        } else {
          console.log("LEFT");
          ballVelocity.x *= -1;
          timeSinceLastHit.x = 0;
        }

        // depending on how far the ball is from the center of the paddle height, we'll add or subtract from the y velocity to make things more interesting
        ballVelocity.y -= BALL_SPEED.y*((this.state.hostCoords.y + PADDLE_DIMS.height/2 - newBallCoords.y)/(PADDLE_DIMS.height/2));


      // otherwise, this is a corner. we'll find the distnace between the ball radius and all corners
      // to establish which corner it is
      } else if(timeSinceLastHit.x > BALL_HIT_TIMEOUT_X && timeSinceLastHit.y > BALL_HIT_TIMEOUT_Y) {
        const distanceTL = HitDetection.distance(newBallCoords, this.state.hostCoords);
        const distanceTR = HitDetection.distance(newBallCoords, {x: this.state.hostCoords.x + PADDLE_DIMS.width, y: this.state.hostCoords.y});
        const distanceBL = HitDetection.distance(newBallCoords, {x: this.state.hostCoords.x, y: this.state.hostCoords.y + PADDLE_DIMS.height});
        const distanceBR = HitDetection.distance(newBallCoords, {x: this.state.hostCoords.x + PADDLE_DIMS.width, y: this.state.hostCoords.y + PADDLE_DIMS.height});
        const distances = [distanceTL, distanceTR, distanceBL, distanceBR];

        // find the minimum idx in the distances array
        let lowest = 0;
        for (let i = 1; i < distances.length; i++) {
          if (distances[i] < distances[lowest]) lowest = i;
        }

        // since the ball is being hit very high up or low down on the paddle, we'll change the y velocity
        if(lowest === 0)  {
          console.log("TOP LEFT CORNER");
          ballVelocity.y -= BALL_SPEED.y;
        } else if(lowest === 1) {
          console.log("TOP RIGHT CORNER");
          ballVelocity.y -= BALL_SPEED.y;
        } else if(lowest === 2) {
          console.log("BOTTOM LEFT CORNER");
          ballVelocity.y += BALL_SPEED.y;
        } else {
          console.log("BOTTOM RIGUHT CORNER");
          ballVelocity.y += BALL_SPEED.y;
        }

        // TODO: add more functionality here utilizing all the different corners
        // to make gameplay easier, let's just reverse the x coordinate
        ballVelocity.x *= -1;
        timeSinceLastHit.x = 0;
        timeSinceLastHit.y = 0;  
      }
    }

    ballVelocity = HitDetection.fixBounds(ballVelocity, MAX_BALL_SPEED, {x: -MAX_BALL_SPEED.x, y: -MAX_BALL_SPEED.y});

    // also, let's just make the ball velocity slow down over time
    ballVelocity.y -= ballVelocity.y > 0 ? 0.01 : -0.01;

    this.setState({
      hostCoords: this.state.pendingHostCoords,
      ballCoords: newBallCoords,
      ballVelocity,
      timeSinceLastHit,
    });
    requestAnimationFrame(this.tick)
  }

  updateHostCoords(coords : Coords) {
    // the host coords should only take up the left half of the screen
    coords.x /= 2;
    // convert the centered coords to the top left corner of the paddle
    this.setState({pendingHostCoords: CoordsConversion.uncenterCoords(coords, PADDLE_DIMS)});
  }

  render() {
    let videoDims = {height: this.state.dims.height, width: this.state.dims.width/2}
    return (
      <div className="game-outer" id={this.state.hostHit ? "hitttt" : ""} style={{height: this.state.dims.height + "px", width: this.state.dims.width + "px"}}>
        <CanvasOverlay hostCoords={this.state.hostCoords} ballCoords={this.state.ballCoords} dims={this.state.dims}></CanvasOverlay>
        <Video updateCoords={this.updateHostCoords} dims={videoDims}></Video>
      </div>
    )
  }
}

export default Game