export interface Coords {
    x: number,
    y: number,
}
  
export interface Dimensions {
    width: number,
    height: number,
}

export type Direction = 'top' | 'left' | 'bottom' | 'right' | 'none';

// if an object has clipped into some other object by "overlap" amount of pixels
export interface Hit {
    direction: Direction,
    overlap: number,
}