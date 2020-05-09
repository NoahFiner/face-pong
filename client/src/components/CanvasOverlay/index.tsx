/// <reference types="webrtc" />

import React, {Component} from 'react';
import './CanvasOverlay.scss'

import {Coords, Dimensions} from '../../utils/types';
import {PADDLE_DIMS, BALL_RADIUS} from '../../utils/constants';

import CoordsConversion from '../../utils/coordsConversion';

// this component will expect NORMALIZED coords and will be responsible for projectFill'ing them
// this component is not responsible for logic dividing the screen into 2. that is handled by the game
interface Props {
  hostCoords: Coords,
  ballCoords: Coords,
  dims: Dimensions,
}

class CanvasOverlay extends Component<Props> {
  private canvas = React.createRef<HTMLCanvasElement>()

  constructor(props : Props) {
    super(props);
    this.paint = this.paint.bind(this);
  }

  componentDidUpdate() {
    this.paint();
  }

  paint() {
    if(this.canvas.current) {
      const context = this.canvas.current.getContext("2d");
      if(context) {
        const hostCoords = CoordsConversion.projectFill(this.props.hostCoords, this.props.dims);
        const ballCoords = CoordsConversion.projectFill(this.props.ballCoords, this.props.dims);
        const paddleDims = CoordsConversion.projectFillDims(PADDLE_DIMS, this.props.dims);
        const ballRadiusDims = CoordsConversion.projectFillDims({height: BALL_RADIUS, width: BALL_RADIUS}, this.props.dims);
        context.clearRect(0, 0, this.props.dims.width, this.props.dims.height);
        context.fillStyle = "#ffffff";
        context.fillRect(hostCoords.x, hostCoords.y, paddleDims.width, paddleDims.height);
        context.beginPath();
        context.arc(ballCoords.x, ballCoords.y, ballRadiusDims.width, 0, Math.PI*2);
        context.fill();
        context.save();
      }
    }
  }

  render() {
    return (
      <canvas ref={this.canvas} className="canvas-outer" width={this.props.dims.width} height={this.props.dims.height}></canvas>
    )
  }
}

export default CanvasOverlay