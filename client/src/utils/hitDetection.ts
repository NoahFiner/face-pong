import {Coords, Dimensions, Direction} from './types';

export default class HitDetection {
    // assuming boundaries are normalized (aka 1000x1500)
    static checkWalls(coords: Coords): Direction {
        if(coords.y <= 0) return "top";
        if(coords.x <= 0) return "left";
        if(coords.y >= 1000) return "bottom";
        if(coords.x >= 1500) return "right";
        return "none";
    }

    // if coordinates are over the max, unmaximize them
    // similarly, if coordinates are below the min, minimize them
    static fixBounds(coords: Coords, maxCoords: Coords, minCoords: Coords): Coords {
        // ensure we don't modify coords unintentionally
        let result: Coords = {...coords};
        if(result.x >= maxCoords.x) result.x = maxCoords.x;
        if(result.x <= minCoords.x) result.x = minCoords.x;
        if(result.y >= maxCoords.y) result.y = maxCoords.y;
        if(result.x <= minCoords.y) result.y = minCoords.y;
        return result;
    }

    static distance(c1: Coords, c2: Coords): number {
        return Math.sqrt(Math.pow(c1.x-c2.x, 2) + Math.pow(c1.y-c2.y, 2));
    }

    // modified from https://stackoverflow.com/a/402010
    // and https://www.gamedevelopment.blog/collision-detection-circles-rectangles-and-polygons/
    static checkBallRectangle(rectCoords: Coords, rectDims: Dimensions, circleCoords: Coords, circleRadius: number): boolean {
        let centeredRectCoords: Coords = {x: rectCoords.x + rectDims.width/2, y: rectCoords.y + rectDims.height/2};

        let circleDistance: Coords = {x: 0, y: 0};
        
        circleDistance.x = Math.abs(circleCoords.x - centeredRectCoords.x);
        circleDistance.y = Math.abs(circleCoords.y - centeredRectCoords.y);
    
        if (circleDistance.x > (rectDims.width/2 + circleRadius)) { return false; }
        if (circleDistance.y > (rectDims.height/2 + circleRadius)) { return false; }
    
        if (circleDistance.x <= (rectDims.width/2)) { return true; } 
        if (circleDistance.y <= (rectDims.height/2)) { return true; }
    
        let cornerDistance_sq: number = (circleDistance.x - rectDims.width/2)^2 +
                             (circleDistance.y - rectDims.height/2)^2;
    
        return (cornerDistance_sq <= (circleRadius^2));
    }
}