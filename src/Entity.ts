import { v4 as uuid_v4 } from 'uuid'
import { BaseComponent } from './components/BaseComponent'

export interface Entity {
    uuid: string
    [property: string]: BaseComponent
}

export function makeEntity(uuid: string = uuid_v4()): Entity {
    return {"uuid": uuid}
}

export function hasAttributes(entity: any, componentNames: string[]): boolean {
    let components = Object.keys(entity)
    for (let x of componentNames) {
        if (!components.includes(x)) {
            return false
        }
    }
    return true
}
