/// <reference types="webrtc" />

import React, {Component} from 'react';
import './Video.scss'

import * as faceapi from 'face-api.js';
import { Point } from 'face-api.js';

import CoordsConversion from '../../utils/coordConversion';

// configure face API
faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
});

//TODO: figure out how to make these global types
interface Coords {
  x: number,
  y: number,
}

interface Dimensions {
  width: number,
  height: number,
}

interface State {
  videoSrc: any,
  loadedVideo: boolean,
  coords: Coords,
  offsetDims: Dimensions,
  videoDims: Dimensions,
  interval: number,
}

// const getUserMedia = (params) => (
//   new Promise((success, error) => {
    
//   })
// )

class Video extends Component<{}, State> {
  private videoRef: React.RefObject<HTMLVideoElement>;

    constructor(props: {}) {
      super(props);
      this.videoRef = React.createRef();
      this.state = {
        videoSrc: null,
        loadedVideo: false,
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

    onVideoLoad() {
      if(this.videoRef.current) {
        this.setState({loadedVideo: true});
        this.setState({offsetDims: {
          height: this.videoRef.current.offsetHeight,
          width: this.videoRef.current.offsetWidth,
        }, videoDims: {
          height: this.videoRef.current.videoHeight,
          width: this.videoRef.current.videoWidth,
        }
        });
      }
    }

    async getMedia(constraints: any) {
      let stream = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (this.videoRef.current) {
          this.videoRef.current.srcObject = stream;
          this.videoRef.current.play();

          this.videoRef.current.onloadedmetadata = async (event) => {
            try {
              if(this.videoRef.current) {
                await this.videoRef.current.play();
                this.onVideoLoad();
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

      await this.loadModels();
      this.setState({interval: window.setInterval(async () => {
        let result = await faceapi.detectSingleFace(this.videoRef.current as any, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true)

        if(result && result.detection.box) {
          const nose: Array<Point> = result.landmarks.getNose()
          this.setState({coords: CoordsConversion.normalize({x: nose[4].x, y: nose[4].y}, this.state.videoDims)});
        }
      }, 30)
      });
    }

  render() {
    let updatedCoords = CoordsConversion.project(this.state.coords, {height: window.innerHeight, width: window.innerWidth/2});
    
      return (
        <>
          <div className="video-outer">
            <div className="dot" style={{transform:
              "translate("+(updatedCoords.x)+"px, "+(updatedCoords.y)+"px)"
              }}></div>
            <video ref={this.videoRef} id="video" src={this.state.videoSrc} autoPlay playsInline></video>
          </div>
          <div className="test-info">
            <p>loaded video: {this.state.loadedVideo ? "true" : "false"}</p>
            <p>coords: {(updatedCoords.x)}, {(updatedCoords.y)}</p>
          </div>
        </>
      )
  }
}

export default Video