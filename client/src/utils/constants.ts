import {Dimensions, Coords} from './types';
export const PADDLE_DIMS: Dimensions = {width: 50, height: 200};
export const BALL_RADIUS: number = 30;
export const BALL_SPEED: Coords = {x: 10, y: 10};
export const MAX_BALL_SPEED: Coords = {x: 15, y: 15};

export const BALL_HIT_TIMEOUT_X: number = PADDLE_DIMS.width/BALL_SPEED.x*2;
export const BALL_HIT_TIMEOUT_Y: number = PADDLE_DIMS.height/BALL_SPEED.y*2;