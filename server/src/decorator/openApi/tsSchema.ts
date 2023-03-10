/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as TJS from 'typescript-json-schema'
import { SchemaObject } from 'openapi3-ts'
import * as path from 'path'
import * as fs from 'fs'
import { globSync } from 'glob'
import symbolName from '@root/typings/api/apiSymbolName'

const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: false,
    skipLibCheck: true,
    skipDefaultLibCheck: true,
    allowJs: true,
    strict: false,
    downlevelIteration: true,
}

let tsSchema: TJS.JsonSchemaGenerator

export function init(rootPath: string) {
    const includeFiles = globSync(path.join(rootPath, '**/*.ts'))
    const program = TJS.getProgramFromFiles(
        includeFiles,
        compilerOptions,
        rootPath
    )

    tsSchema = TJS.buildGenerator(program, {
        required: true,
    })

    return tsSchema
}

export function genCode(rootPath: string) {
    if (tsSchema) {
        const types = tsSchema
            .getUserSymbols()
            .filter((v) => v.startsWith('API.'))
            .concat(['number', 'boolean', 'string', 'any'])
        // .map((v) => `'${v}'`)

        const code = `type symbolName =
    | ${types.map((v) => `'${v}'`).join(`
    | `)}
    | ${types.map((v) => `'${v}[]'`).join(`
    | `)}

export default symbolName`
        const outFile = path.join(rootPath, 'apiSymbolName.d.ts')

        const oldCode = fs.readFileSync(outFile, 'utf8')
        if (oldCode !== code) {
            fs.writeFileSync(outFile, code, 'utf8')
        }
    }
}

export function getSchemaObject(name: symbolName) {
    if (!tsSchema || name === 'any') {
        return {}
    }

    let schema: SchemaObject

    switch (name) {
        case 'number':
        case 'boolean':
        case 'string':
            schema = {
                type: name,
            }
            break

        default:
            // @ts-ignore
            schema = (tsSchema.getSchemaForSymbol(name, true) ||
                {}) as SchemaObject
    }

    return schema
}

export default function get(name: symbolName) {
    if (!tsSchema || name === 'any') {
        return {
            schema: {},
            components: {},
        }
    }
    if (name.endsWith('[]')) {
        const sName = name.replace('[]', '') as symbolName
        const res = get(sName)

        return {
            schema: {
                type: 'array',
                items: res.schema,
            },
            components: res.components,
        }
    }

    const schema = getSchemaObject(name)

    // @ts-ignore
    if (schema.$schema) {
        // @ts-ignore
        delete schema.$schema
    }

    let components: {
        [schema: string]: SchemaObject
    } = {}
    // @ts-ignore
    if (schema.definitions) {
        components = JSON.parse(
            // @ts-ignore
            JSON.stringify(schema.definitions)
                .replace(/#\/definitions\//g, '#/components/schemas/')
                .replace(
                    /#\/components\/schemas\/API./g,
                    '#/components/schemas/'
                )
        )
        // @ts-ignore
        delete schema.definitions

        const data = JSON.stringify(schema)
            .replace(/#\/definitions\//g, '#/components/schemas/')
            .replace(/#\/components\/schemas\/API./g, '#/components/schemas/')

        let schemaData = JSON.parse(data)

        if (schemaData.type === 'object') {
            const typeName = name.replace('API.', '').replace(/\./g, '')
            components[typeName] = schemaData
            schemaData = {
                $ref: `#/components/schemas/${typeName}`,
            }
        }

        Object.keys(components).forEach((key) => {
            if (key.indexOf('API.') === 0) {
                const newKey = key.replace('API.', '').replace(/\./g, '')
                const component = components[key]
                if (component.type === 'object' && component.properties) {
                    Object.keys(component.properties).forEach((k) => {
                        const props = component.properties[k] as any
                        if (
                            props.type === 'array' &&
                            props.items &&
                            typeof props.items.$ref === 'string'
                        ) {
                            // @ts-ignore
                            props.items.$ref = String(props.items.$ref).replace(
                                /\./g,
                                ''
                            )
                        }
                    })
                }

                components[newKey] = component
                delete components[key]
            }
        })

        return {
            schema: schemaData,
            components,
        }
    } else if (name.startsWith('API.')) {
        const schemaName = name.replace('API.', '').replace(/\./g, '')
        const refName = `#/components/schemas/${schemaName}`

        components[schemaName] = schema

        return {
            schema: {
                $ref: refName,
            },
            components,
        }
    }

    return {
        schema,
        components,
    }
}
