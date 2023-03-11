import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core'

// 引入数据源
import { UserModel } from '@root/model/user'

export default (appInfo: MidwayAppInfo) => {
    return {
        // use for cookie sign key, should change to your own and keep security
        keys: appInfo.name + 'ins_1677644272937_7252',
        egg: {
            port: 7001,
        },
        security: {
            csrf: {
                enable: false,
            },
        },
        middleware: [],
        sequelize: {
            dataSource: {
                // 第一个数据源，数据源的名字可以完全自定义
                default: {
                    database: 'ins',
                    username: 'root',
                    password: 'aa123456',
                    host: '127.0.0.1',
                    port: 3306,
                    encrypt: false,
                    dialect: 'mysql',
                    define: { charset: 'utf8' },
                    timezone: '+08:00',
                    entities: [UserModel],
                    // 本地的时候，可以通过 sync: true 直接 createTable
                    sync: appInfo.env === 'local',
                },
            },
        },
        jwtSecret: 'shawzhou',
        authWhiteList: ['/api/v2/login', '/api/v2/login/register'],
        auth_cookie_name: 'token',
    } as MidwayConfig
}
