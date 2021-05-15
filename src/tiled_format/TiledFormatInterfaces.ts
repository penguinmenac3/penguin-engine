
export interface RawTiledFormatChunk {
    data: number[];
    height: number;
    width: number;
    x: number;
    y: number;
}

export interface RawTiledFormatPoint {
    x: number;
    y: number;
}

export interface RawTiledFormatText {
    bold: boolean;
    color: string;
    fontfamily: string;
    halign: string;
    italic: boolean;
    kerning: boolean;
    pixelsize: number;
    strikeout: boolean;
    text: string;
    underline: boolean;
    valign: string;
    wrap: boolean;
}

export interface RawTiledFormatObject {
    ellipse?: boolean; // only if ellipse
    gid?: number; // only if object represents a tile
    height: number;
    id: number;
    name: string;
    point?: boolean; // only if point
    polygon?: RawTiledFormatPoint[]; // only if polygon
    polyline?: RawTiledFormatPoint[]; // only if polyline
    properties?: RawTiledFormatProperty[];
    rotation: number;
    template?: string; // if object is template instance
    text?: Text; // if text object
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
}

export interface RawTiledFormatLayer {
    chunks?: RawTiledFormatChunk[]; // tilelayer only
    compression?: string; // tilelayer only
    draworder?: string; // objectgroup only
    // data is not used, see chunks instead
    // encoding is not used
    height: number;
    id: number;
    image?: string; // imagelayer only
    layers?: RawTiledFormatLayer; // group only
    name: string;
    objects?: RawTiledFormatObject[]; // objectgroup only
    offsetx?: number;
    offsety?: number;
    opacity: number;
    properties?: RawTiledFormatProperty[];
    startx?: number;
    starty?: number;
    tintcolor?: string;
    transparentcolor?: string;
    type: string;
    visible: boolean;
    width?: number;
    x: number;
    y: number;
}

export interface RawTiledFormatFrame {
    duration: number;
    tileid: number;
}

export interface RawTiledFormatTile {
    animation?: RawTiledFormatFrame[];
    id: number;
    image?: string;
    imageheight?: number;
    imagewidth?: number;
    objectgroup?: RawTiledFormatLayer;
    probability?: number;
    properties?: RawTiledFormatProperty[];
    terrain?: number[];
    type?: string;
}

export interface RawTiledFormatTileOffset {
    x: number;
    y: number;
}

export interface RawTiledFormatTerrain {
    name: string;
    properties: RawTiledFormatProperty[];
    tile: number;
}

export interface RawTiledFormatProperty {
    name: string;
    type: string;
    value: any;
}

export interface RawTiledFormatGrid {
    width: number;
    height: number;
    orientation: string;
}

export interface RawTiledFormatTileset {
    backgroundcolor?: string;
    columns: number;
    firstgid?: number;
    grid?: RawTiledFormatGrid;
    image: string;
    imageheight: number;
    imagewidth: number;
    margin: number;
    name: string;
    objectalignment?: string;
    properties?: RawTiledFormatProperty[];
    source: string;
    spacing: number;
    terrains?: RawTiledFormatTerrain[];
    tilecount: number;
    tiledversion: string;
    tileheight: number;
    tileoffset?: RawTiledFormatTileOffset;
    tiles?: RawTiledFormatTile[];
    tilewidth: number;
    transparentcolor?: string;
    type: string;
    version: number;
    wangsets: any[];
}

export interface RawTiledFormatMap {
    backgroundcolor?: string;
    compressionlevel: number;
    height: number;
    hexsidelength?: number; // hexagonal maps only
    infinite: boolean;
    layers: RawTiledFormatLayer[];
    nextlayerid: number;
    nextobjectid: number;
    orientation: string;
    properties?: RawTiledFormatProperty[];
    renderorder: string;
    staggeraxis?: string;
    staggerindex?: string;
    tiledversion: string;
    tileheight: number;
    tilesets: RawTiledFormatTileset[];
    tilewidth: number;
    type: string;
    version: number;
    width: number;
}
