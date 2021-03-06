import "./utils/strings"
import { GameEngine } from "./GameEngine"
import * as Entity from "./Entity"
import * as components from "./components/_api"
import * as commands from "./commands/_api"
import * as geometry from "./geometry/_api"
import * as systems from "./systems/_api"
import * as gui from "./gui/_api"
import * as arrays from "./utils/arrays"
import * as tiled_format from "./tiled_format/_api"

export default GameEngine
export { arrays, components, commands, Entity, gui, geometry, systems, tiled_format }
