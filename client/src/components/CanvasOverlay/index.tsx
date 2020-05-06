/// <reference types="webrtc" />

import React, {Component} from 'react';
import './CanvasOverlay.scss'

import {Coords, Dimensions} from '../../utils/types';

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
        context.clearRect(0, 0, this.state.dims.width, this.state.dims.height);
        context.fillStyle = "#ffffff";
        context.fillRect(this.props.hostCoords.x, this.props.hostCoords.y, 30, 200);
        context.beginPath();
        context.arc(this.props.ballCoords.x, this.props.ballCoords.y, 30, 0, Math.PI*2);
        context.fill();
        context.save();
      }
    }
  }

  render() {
    return (
      <canvas ref={this.canvas} className="canvas-outer" width={window.innerWidth} height={window.innerHeight}></canvas>
    )
  }
}

export default CanvasOverlay