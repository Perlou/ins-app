import { App, Configuration, ILifeCycle } from '@midwayjs/core'
import { Application } from 'egg'
import { join } from 'path'
import * as egg from '@midwayjs/web'
// import * as swagger from '@midwayjs/swagger'
import * as sequelize from '@midwayjs/sequelize'
import openApi, { document } from './decorator/openApi'

@Configuration({
    imports: [
        egg,
        // {
        //     component: swagger,
        //     enabledEnvironment: ['local'],
        // },
        sequelize,
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
        /**
         * 使用 open api 声明
         */
        await openApi(this.app, {
            enable: true,
        })

        /**
         * open api 文档配置
         */
        document
            .setTitle('ins-app')
            .setVersion(process.env.npm_package_version)
            .setDescription('ins-app')
            .setSecuritySchemes({
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'authorization',
                },
            })

        console.log('====================================')
        console.log('✅  Your awesome APP launched')
        console.log('====================================')
    }
}
