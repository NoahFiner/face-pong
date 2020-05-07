/// <reference types="webrtc" />

import React, {Component} from 'react';
import './CanvasOverlay.scss'

import {Coords, Dimensions} from '../../utils/types';

import CoordsConversion from '../../utils/coordsConversion';

// this component will expect NORMALIZED coords and will be responsible for projectFill'ing them
// this component is not responsible for logic dividing the screen into 2. that is handled by the game
interface Props {
  hostCoords: Coords,
  ballCoords: Coords,
}

interface State {
  dims: Dimensions,
}

class CanvasOverlay extends Component<Props, State> {
  private canvas = React.createRef<HTMLCanvasElement>()

  constructor(props : Props) {
    super(props);
    this.state = {
      dims: {height: 0, width: 0},
    }
    this.paint = this.paint.bind(this);
  }

  updateDimensions() {
    this.setState({
      dims: {width: window.innerWidth, height: window.innerHeight}
    })
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentDidUpdate() {
    this.paint();
  }

  paint() {
    if(this.canvas.current) {
      const context = this.canvas.current.getContext("2d");
      if(context) {
        const hostCoords = CoordsConversion.projectFill(this.props.hostCoords, this.state.dims);
        const ballCoords = CoordsConversion.projectFill(this.props.ballCoords, this.state.dims);
        context.clearRect(0, 0, this.state.dims.width, this.state.dims.height);
        context.fillStyle = "#ffffff";
        context.fillRect(hostCoords.x, hostCoords.y, 30, 30);
        context.beginPath();
        context.arc(ballCoords.x, ballCoords.y, 30, 0, Math.PI*2);
        context.fill();
        context.save();
      }
    }
  }

  render() {
    return (
      <canvas ref={this.canvas} className="canvas-outer" width={this.state.dims.width} height={this.state.dims.height}></canvas>
    )
  }
}

export default CanvasOverlay