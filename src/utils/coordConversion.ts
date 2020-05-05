interface Coords {
    x: number,
    y: number,
}

interface Dimensions {
    height: number,
    width: number,
}

const ratio = function(coords: Dimensions) : number {
    return coords.width/coords.height;
}

// we will be normalizing coords 
export default class CoordsConversion {
    // convert from coords in a box to 1000px x 1000px normalized grid
    static normalize(coords: Coords, dims: Dimensions) : Coords {
        return {
            x: coords.x/dims.width*1000,
            y: coords.y/dims.height*1000,
        }
    }

    // project normalized coords into a new dimension
    static projectFill(coords: Coords, dims: Dimensions) : Coords {
        return {
            x: (coords.x/1000)*dims.width,
            y: (coords.y/1000)*dims.height,
        }
    }

    static projectCover(coords: Coords, contentDims: Dimensions, coverDims: Dimensions) : Coords {
        let result = {x: 0, y: 0};
        console.log(contentDims, coverDims);
        // if the top/bottom of the content is cut off with the cover
        if(ratio(coverDims) > ratio(contentDims)) {
            // scale the y by height (just like the project function)
            result.x = (coords.x/1000)*coverDims.width;

            // convert the normalized x back to video coords
            const origY = (coords.y/1000)*contentDims.height;
            // get the trimmed off left space in terms of the cover coords
            const cutOffSpace = (coverDims.height - contentDims.height*(coverDims.width/contentDims.width))/2
            // scale the original video x by the height ratio
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
}