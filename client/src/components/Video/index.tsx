/// <reference types="webrtc" />

import React, {Component} from 'react';
import './Video.scss'

import * as faceapi from 'face-api.js';
import { Point } from 'face-api.js';

import CoordsConversion from '../../utils/coordsConversion';
import {Coords, Dimensions} from '../../utils/types';

// configure face API
faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
});

interface State {
  videoSrc: any,
  loadedVideo: boolean,
  loadedModels: boolean,
  coords: Coords,
  offsetDims: Dimensions,
  videoDims: Dimensions,
  interval: number,
}

interface Props {
  updateCoords(coords: Coords): void
}

class Video extends Component<Props, State> {
  private videoRef: React.RefObject<HTMLVideoElement>;

    constructor(props: Props) {
      super(props);
      this.videoRef = React.createRef();
      this.state = {
        videoSrc: null,
        loadedVideo: false,
        loadedModels: false,
        coords: {x: 0, y: 0},
        offsetDims: {height: 0, width: 0},
        videoDims: {height: 0, width: 0},
        interval: 0,
      }
    }

    async loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')
    }

    updateOffsetDims() {
      if(this.videoRef.current) {
        this.setState({offsetDims: {
          height: this.videoRef.current.offsetHeight,
          width: this.videoRef.current.offsetWidth,
        }});
      }
    }

    updateVideoDims() {
      if(this.videoRef.current) {
        this.setState({loadedVideo: true, videoDims: {
          height: this.videoRef.current.videoHeight,
          width: this.videoRef.current.videoWidth,
        }});
      }
    }

    async getMedia(constraints: any) {
      let stream = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (this.videoRef.current) {
          this.videoRef.current.srcObject = stream;
          this.videoRef.current.play();

          this.videoRef.current.onloadedmetadata = async () => {
            try {
              if(this.videoRef.current) {
                await this.videoRef.current.play();
                this.updateVideoDims();
                this.updateOffsetDims();
              }
            } catch (e) {
              console.error(e)
            }
          }

        } else {
          throw new Error("video not found");
        }

      } catch(e) {
        alert("webcam couldn't connect" + JSON.stringify(e));
      }
    }

    async componentDidMount() {
      this.getMedia({video: true});

      window.addEventListener("resize", this.updateOffsetDims.bind(this));

      await this.loadModels();
      this.setState({loadedModels: true, interval: window.setInterval(async () => {
        let result = await faceapi.detectSingleFace(this.videoRef.current as any, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true)

        if(result && result.detection.box) {
          const nose: Array<Point> = result.landmarks.getNose()
          this.setState({coords: CoordsConversion.normalizeCover({x: nose[6].x, y: nose[6].y}, this.state.videoDims, this.state.offsetDims)});
          let updatedCoords = CoordsConversion.projectFill(this.state.coords,
            this.state.offsetDims);
          this.props.updateCoords(updatedCoords);
        }
      }, 30)
      });
    }

  render() {
    
      return (
        <>
          <div className="video-outer">
            <video ref={this.videoRef} id="video" src={this.state.videoSrc} autoPlay playsInline></video>
          </div>
          <div className="test-info">
            <p>loaded video: {this.state.loadedVideo ? "true" : "false"}</p>
            <p>loaded models: {this.state.loadedModels ? "true" : "false"}</p>
            <p>coords: {(this.state.coords.x)}, {(this.state.coords.y)}</p>
          </div>
        </>
      )
  }
}

export default Video