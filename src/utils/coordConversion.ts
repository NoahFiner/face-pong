interface Coords {
    x: number,
    y: number,
}

interface Dimensions {
    height: number,
    width: number,
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
    static project(coords: Coords, dims: Dimensions) : Coords {
        return {
            x: (coords.x/1000)*dims.width,
            y: (coords.y/1000)*dims.height,
        }
    }
}