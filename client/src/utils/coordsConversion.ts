import {Coords, Dimensions} from './types';
import { resizeResults } from 'face-api.js';

const ratio = function(coords: Dimensions) : number {
    return coords.width/coords.height;
}

const PADDLE_DIMS : Dimensions = {width: 30, height: 30};

// we will be normalizing coords 
export default class CoordsConversion {
    // convert from coords in a box to 1000px x 1000px normalized grid, assuming a normalized fill
    static normalizeFill(coords: Coords, dims: Dimensions) : Coords {
        return {
            x: coords.x/dims.width*1000,
            y: coords.y/dims.height*1000,
        }
    }

    // convert from 
    static normalizeCover(coords: Coords, contentDims: Dimensions, coverDims: Dimensions) : Coords {
        let result = {x: 0, y: 0};
        // if the top/bottom of the content is cut off with the cover
        console.log(contentDims, coverDims);
        if(ratio(coverDims) > ratio(contentDims)) {
            // calculate the scaling factor (which will involve the width)
            const contentToCoverScaling = (coverDims.width/contentDims.width);

            // scale the x in content units to normal units
            result.x = (coords.x*contentToCoverScaling)/coverDims.width*1000;

            // scale the y in content units to cover units
            result.y = coords.y*contentToCoverScaling;

            // find the amount of cut off top space in terms of cover units
            const cutOffSpace = (coverDims.height - contentDims.height*contentToCoverScaling)/2;
            // subtract this from y
            result.y += cutOffSpace;

            // convert y to normal units
            result.y = result.y/coverDims.height*1000;
        } else {
            // calculate the scaling factor (which will involve the height)
            const contentToCoverScaling = (coverDims.height/contentDims.height);

            // scale the y in content units to normal units
            result.y = (coords.y*contentToCoverScaling)/coverDims.height*1000;

            // scale the x in content units to cover units
            result.x = coords.x*contentToCoverScaling;

            // find the amount of cut off left space in terms of cover units
            const cutOffSpace = (coverDims.width - contentDims.width*contentToCoverScaling)/2;
            // subtract this from x
            result.x += cutOffSpace;

            // convert x to normal units
            result.x = result.x/coverDims.width*1000;
        }

        if(result.x < 0) result.x = 0;
        if(result.x > 1000) result.x = 1000;
        if(result.y < 0) result.y = 0;
        if(result.y > 1000) result.y = 1000;
        return result;
    }

    // project normalized coords into a new dimension, assuming a valid fill
    static projectFill(coords: Coords, dims: Dimensions) : Coords {
        return {
            x: (coords.x/1000)*dims.width,
            y: (coords.y/1000)*dims.height,
        }
    }

    // project a normalized fill to a cover
    // (content would represent the original video, cover would represent the canvas goal dimensions)
    static projectCover(coords: Coords, contentDims: Dimensions, coverDims: Dimensions) : Coords {
        let result = {x: 0, y: 0};
        console.log(contentDims, coverDims);
        // if the top/bottom of the content is cut off with the cover
        if(ratio(coverDims) > ratio(contentDims)) {
            // scale the x by width (just like the project function)
            result.x = (coords.x/1000)*coverDims.width;

            // convert the normalized y back to video coords
            const origY = (coords.y/1000)*contentDims.height;
            // get the trimmed off top space in terms of the cover coords
            const cutOffSpace = (coverDims.height - contentDims.height*(coverDims.width/contentDims.width))/2
            // scale the original video y by the width ratio
            result.y = origY*(coverDims.width/contentDims.width) + cutOffSpace;
        } else {
            // scale the y by height (just like the project function)
            result.y = (coords.y/1000)*coverDims.height;

            // convert the normalized x back to video coords
            const origX = (coords.x/1000)*contentDims.width;
            // get the trimmed off left space in terms of the cover coords
            const cutOffSpace = (coverDims.width - contentDims.width*(coverDims.height/contentDims.height))/2
            // scale the original video x by the height ratio
            result.x = origX*(coverDims.height/contentDims.height) + cutOffSpace;
        }
        return result;
    }

    static centerCoords(coords:Coords) : Coords {
        return {
            x: coords.x - PADDLE_DIMS.width/2,
            y: coords.y - PADDLE_DIMS.height/2,
        }
    }
}