/// <reference types="webrtc" />

import React, {Component} from 'react';
import './Video.scss'

import * as faceapi from 'face-api.js';
import { Point } from 'face-api.js';

// configure face API
faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
});

interface Coords {
  x: number,
  y: number,
}

class Video extends Component<{}, {videoSrc: any, loaded: boolean, coords: Coords, interval: number}> {
  private videoRef: React.RefObject<HTMLVideoElement>;

    constructor(props: {}) {
      super(props);
      this.videoRef = React.createRef();
      this.state = {
        videoSrc: null,
        loaded: false,
        coords: {x: 0, y: 0},
        interval: 0,
      }
      this.handleVideo = this.handleVideo.bind(this);
    }

    async loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')
    }

    async componentDidMount() {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
 
      if (navigator.getUserMedia) {       
        navigator.getUserMedia({video: true}, this.handleVideo, this.videoError);
      }

      await this.loadModels();
      this.setState({interval: window.setInterval(async () => {
        let result = await faceapi.detectSingleFace(this.videoRef.current as any, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true)

        if(result && result.detection.box) {
          const nose: Array<Point> = result.landmarks.getNose()
          this.setState({coords: {x: nose[4].x, y: nose[4].y}})
        }
      }, 50)
      });
    }
    
    handleVideo(stream: any) {
      // Update the state, triggering the component to re-render with the correct stream
      if (this.videoRef.current !== null) {
        this.videoRef.current.srcObject = stream;
      }
    }
  
    videoError() {
  
    }

  render() {
      return (
        <>
          <p>coords: {(this.state.coords.x)}, {(this.state.coords.y)}</p>
          <div className="video-outer">
            <div className="dot" style={{transform:
              "translate("+(this.state.coords.x)+"px, "+(this.state.coords.y)+"px)"
              }}></div>
            <video ref={this.videoRef} id="video" src={this.state.videoSrc} autoPlay playsInline></video>
          </div>
        </>
      )
  }
}

export default Video