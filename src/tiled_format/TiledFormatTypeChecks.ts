import {
    RawTiledFormatChunk,
    RawTiledFormatFrame,
    RawTiledFormatGrid,
    RawTiledFormatLayer,
    RawTiledFormatMap,
    RawTiledFormatObject,
    RawTiledFormatPoint,
    RawTiledFormatTerrain,
    RawTiledFormatText,
    RawTiledFormatTile,
    RawTiledFormatTileOffset,
    RawTiledFormatTileset
} from "./TiledFormatInterfaces";

export function assertTrue(predicate: boolean): void | never {
    if (!predicate) {
        throw new Error("Assertion failed")
    }
}
export function assertNonNull(object: any): void {
    assertTrue(object !== null && object !== undefined)
}
export function assertNonNullAnd(object: any, typeCheck: any): void {
    assertNonNull(object)
    assertTrue(typeCheck(object))
}
export function assertNullOr(object: any, typeCheck: any): void {
    assertTrue(object === null || object === undefined || typeCheck(object))
}
export function assertArrayWithCheck(object: any, typeCheck: any): boolean {
    assertNonNull(object)
    assertTrue(Array.isArray(object))
    for (let element of object) {
        assertTrue(typeCheck(element))
    }
    return true;
}
export function assertInSet(object: any, set: any[]): boolean {
    for (let element of set) {
        if (object == element) {
            return true;
        }
    }
    return false;
}
export function assertBoolean(object: any): object is boolean {
    assertNonNull(object)
    assertTrue(typeof (object) === "boolean")
    return true
}
export function assertString(object: any): object is string {
    assertNonNull(object)
    assertTrue(typeof (object) === "string")
    return true
}
export function assertInt(object: any): object is number {
    assertNonNull(object)
    assertTrue(typeof (object) === "number" && (object == (object | 0)))
    return true
}
export function assertNumber(object: any): object is number {
    assertNonNull(object)
    assertTrue(typeof (object) === "number")
    return true
}
export function assertColor(object: string): object is string {
    assertNonNull(object)
    return assertString(object); // TODO
}


function assertTypeChunk(object: any): object is RawTiledFormatChunk | never {
    // Not supporting base64 data
    assertArrayWithCheck(object.data, assertNumber) // don't use assertInt, larger than signed 32 bit
    assertInt(object.height)
    assertInt(object.width)
    assertInt(object.x)
    assertInt(object.y)

    assertTrue((object.width * object.height) == object.data.length);
    return true
}

function assertTypePoint(object: any): object is RawTiledFormatPoint | never {
    assertNumber(object.x)
    assertNumber(object.y)
    return true
}

function assertTypeText(object: any): object is RawTiledFormatText | never {
    assertBoolean(object.bold)
    assertColor(object.color)
    assertString(object.fontfamily)
    assertString(object.halign)
    assertBoolean(object.italic)
    assertBoolean(object.kerning)
    assertInt(object.pixelsize)
    assertBoolean(object.strikeout)
    assertString(object.text)
    assertBoolean(object.underline)
    assertString(object.valign)
    assertBoolean(object.wrap)

    assertInSet(object.halign, ["center", "right", "justify", "left"])
    assertInSet(object.lalign, ["center", "bottom", "top"])
    return true
}

function assertTypeObject(object: any): object is RawTiledFormatObject | never {
    assertNullOr(object.ellipse, assertBoolean)
    assertNullOr(object.gid, assertInt)
    assertNumber(object.height)
    assertInt(object.id)
    assertString(object.name)
    assertNullOr(object.point, assertBoolean)
    assertNullOr(object.polygon, (e: any) => assertArrayWithCheck(e, assertTypePoint))
    assertNullOr(object.polyline, (e: any) => assertArrayWithCheck(e, assertTypePoint))
    assertNullOr(object.properties, (e: any) => assertArrayWithCheck(e, assertTypeProperty))
    assertNumber(object.rotation)
    assertNullOr(object.template, assertString)
    assertNullOr(object.text, assertTypeText)
    assertString(object.type)
    assertBoolean(object.visible)
    assertNumber(object.width)
    assertNumber(object.x)
    assertNumber(object.y)
    return true
}

function assertTypeLayer(object: any): object is RawTiledFormatLayer | never {
    assertNullOr(object.chunks, (e: any) => assertArrayWithCheck(e, assertTypeChunk))
    assertNullOr(object.compression, assertString)
    assertNullOr(object.data, (e: any) => assertTrue(false))
    assertNullOr(object.draworder, assertString)
    assertNullOr(object.encoding, (e: any) => assertTrue(false))
    assertNullOr(object.height, assertInt)
    assertNullOr(object.image, assertString)
    assertNullOr(object.layers, (e: any) => assertArrayWithCheck(e, assertTypeLayer))
    assertString(object.name)
    assertNullOr(object.objects, (e: any) => assertArrayWithCheck(e, assertTypeObject))
    assertNullOr(object.offsetx, assertNumber)
    assertNullOr(object.offsety, assertNumber)
    assertNumber(object.opacity)
    assertNullOr(object.properties, (e: any) => assertArrayWithCheck(e, assertTypeProperty))
    assertNullOr(object.startx, assertInt)
    assertNullOr(object.starty, assertInt)
    assertNullOr(object.tintcolor, assertColor)
    assertNullOr(object.transparentcolor, assertColor)
    assertString(object.type)
    assertBoolean(object.visible)
    assertNullOr(object.width, assertInt)
    assertInt(object.x)
    assertInt(object.y)

    if (object.type == "tilelayer") {
        assertNullOr(object.compression, (o: any) => { assertString(o); assertInSet(o, ["zlib", "gzip", "zstd", ""]) })
        assertNonNull(object.chunks)
    } else if (object.type == "objectgroup") {
        assertString(object.draworder)
        assertArrayWithCheck(object.objects, assertTypeObject)
    }

    assertInSet(object.type, ["tilelayer", "objectgroup", "imagelayer", "group"])
    assertTrue(object.x === 0)
    assertTrue(object.y === 0)
    return true
}

function assertTypeFrame(object: any): object is RawTiledFormatFrame | never {
    assertInt(object.duration)
    assertInt(object.tileid)
    return true
}

function assertTypeTile(object: any): object is RawTiledFormatTile | never {
    assertNullOr(object.animation, (o: any) => assertArrayWithCheck(o, assertTypeFrame))
    assertInt(object.id)
    assertNullOr(object.image, assertString)
    assertNullOr(object.imageheight, assertInt)
    assertNullOr(object.imagewidth, assertInt)
    assertNullOr(object.objectgroup, assertTypeLayer)
    assertNullOr(object.propability, assertNumber)
    assertNullOr(object.properties, (o: any) => assertArrayWithCheck(o, assertTypeProperty))
    assertNullOr(object.terrain, assertTypeTerrain)
    assertNullOr(object.type, assertString)
    return true
}

function assertTypeTileOffset(object: any): object is RawTiledFormatTileOffset | never {
    assertInt(object.x)
    assertInt(object.y)
    return true
}

function assertTypeTerrain(object: any): object is RawTiledFormatTerrain | never {
    assertString(object.name)
    assertArrayWithCheck(object.properties, assertTypeProperty)
    assertInt(object.tile)
    return true;
}

function assertTypeProperty(object: any): object is RawTiledFormatGrid | never {
    assertString(object.name)
    assertString(object.type);
    assertTrue("value" in object)

    switch (object.type) {
        case "string":
            assertString(object.value);
            break;
        case "int":
            assertInt(object.value);
            break;
        case "float":
            assertNumber(object.value);
            break;
        case "bool":
            assertBoolean(object.value);
            break;
        case "color":
            assertColor(object.value);
            break;
        case "file":
            assertString(object.value);
            break;
        case "object":
            assertInt(object.value);
            break;
        default:
            assertTrue(false)
            break;
    }
    return true;
}

function assertTypeGrid(object: any): object is RawTiledFormatGrid  | never {
    assertInt(object.width)
    assertInt(object.height)
    assertString(object.orientation)

    assertInSet(object.orientation, ["orthogonal", "isometric"])
    return true
}

function assertTypeTileset(object: any): object is RawTiledFormatTileset | never {
    assertNullOr(object.backgroundcolor, assertColor)
    assertInt(object.columns)
    assertNullOr(object.firstgid, assertInt)
    assertNullOr(object.grid, assertTypeGrid)
    assertString(object.image)
    assertInt(object.imageheight)
    assertInt(object.imagewidth)
    assertInt(object.margin)
    assertString(object.name)
    assertNullOr(object.objectalignment, assertString)
    assertNullOr(object.properties, (o: any) => assertArrayWithCheck(o, assertTypeProperty))
    assertNullOr(object.source, () => assertTrue(false))
    assertInt(object.spacing)
    assertNullOr(object.terrains, assertTypeTerrain)
    assertInt(object.tilecount)
    assertString(object.tiledversion)
    assertInt(object.tileheight)
    assertNullOr(object.tileoffset, assertTypeTileOffset)
    assertNullOr(object.tiles, (o: any) => assertArrayWithCheck(o, assertTypeTile))
    assertInt(object.tilewidth)
    assertNullOr(object.transparentcolor, assertColor)
    assertString(object.type)
    assertNumber(object.version)
    // assertArrayWithCheck(object.wangsets, isTypeWangSet)

    assertTrue(object.type == "tileset")
    assertInSet(object.objectalignment, ["unspecified", "topleft", "top", "topright", "left",
        "center", "right", "bottomleft", "bottom", "bottomright"]);
    return true;
}

function assertTypeMap(object: any): object is RawTiledFormatMap | never {
    assertNullOr(object.backgroundcolor, assertColor)
    assertInt(object.compressionlevel)
    assertInt(object.height)
    assertNullOr(object.hexsidelength, assertInt)
    assertBoolean(object.infinite)
    assertNullOr(object.layers, (e: any) => assertArrayWithCheck(e, assertTypeLayer))
    assertInt(object.nextlayerid)
    assertInt(object.nextobjectid)
    assertString(object.orientation)
    assertNullOr(object.properties, (o: any) => assertArrayWithCheck(o, assertTypeProperty))
    assertString(object.renderorder)
    assertNullOr(object.staggeraxassert, assertString)
    assertNullOr(object.staggerindex, assertString)
    assertInt(object.tileheight)
    assertArrayWithCheck(object.tilesets, (e: any) => {
        if (e.source) {
            assertInt(e.firstgid)
            assertString(e.source)
        } else {
            assertTypeTileset(e)
        }
        return true
    })
    assertInt(object.tilewidth)
    assertString(object.type)
    assertNumber(object.version)
    assertInt(object.width)

    let isHexagonalMap = object.orientation == "hexagonal";
    let fullfillsSpecialChecks = (object.type == "map") &&
        assertInSet(object.renderorder, ["right-down", "right-up", "left-down", "left-up"]) &&
        assertInSet(object.orientation, ["orthogonal", "isometric", "staggered", "hexagonal"]) &&
        (!isHexagonalMap || ("staggeraxis" in object && assertInSet(object.staggeraxis, ["x", "y"]))) &&
        (!isHexagonalMap || ("staggerindex" in object && assertInSet(object.staggeraxis, ["odd", "even"])));

    assertTrue(fullfillsSpecialChecks)
    return true;
}

export default {
    assertTypeChunk: assertTypeChunk,
    assertTypePoint: assertTypePoint,
    assertTypeText: assertTypeText,
    assertTypeObject: assertTypeObject,
    assertTypeLayer: assertTypeLayer,
    assertTypeFrame: assertTypeFrame,
    assertTypeTile: assertTypeTile,
    assertTypeTileOffset: assertTypeTileOffset,
    assertTypeTerrain: assertTypeTerrain,
    assertTypeProperty: assertTypeProperty,
    assertTypeTileset: assertTypeTileset,
    assertTypeMap: assertTypeMap
}
