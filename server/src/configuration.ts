import { App, Configuration, ILifeCycle } from '@midwayjs/core'
import { Application } from 'egg'
import { join } from 'path'
import * as egg from '@midwayjs/web'
import * as swagger from '@midwayjs/swagger'

@Configuration({
    imports: [
        egg,
        {
            component: swagger,
            enabledEnvironment: ['local'],
        },
    ],
    importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle implements ILifeCycle {
    @App()
    app: Application

    async onReady() {
        console.log('====================================')
        console.log('🚀  Your awesome APP is launching...')
        console.log('====================================')

        console.log('====================================')
        console.log('✅  Your awesome APP launched')
        console.log('====================================')
    }
}
