import { loadObjectFromRemoteJSONFile } from "./TiledFormatMap";


export interface TiledObjectType {
    readonly color: string;
    readonly properties: Map<string, any>;
}

export class TiledFormatObjectTypes {
    private constructor(
        public readonly types: Map<string, TiledObjectType>
    ) { }

    public static async load(path: string): Promise<TiledFormatObjectTypes> {
        let object = await loadObjectFromRemoteJSONFile(path);
        if (object == null) {
            throw new Error("Could not download objectypes: " + path);
        }

        let types = new Map<string, TiledObjectType>();
        for (let date of object) {
            let properties = new Map<string, any>();
            for (let property of date.properties) {
                properties.set(property.name, property.value);
            }
            var fixedColor: string = "#" + date.color.substring(3);
            types.set(date.name, { color: fixedColor, properties: properties });
        }
        let objectTypes = new TiledFormatObjectTypes(types);
        return objectTypes;
    }
}
