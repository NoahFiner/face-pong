import {Coords, Direction} from './types';

export default class HitDetection {
    // assuming boundaries are normalized (aka 1000x1000)
    static checkWalls(coords: Coords): Direction {
        if(coords.y <= 0) return "top";
        if(coords.x <= 0) return "left";
        if(coords.y >= 1000) return "bottom";
        if(coords.x >= 1000) return "right";
        return "none";
    }
}