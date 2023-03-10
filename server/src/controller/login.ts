import { Body, Config, Controller, Inject, Post, Provide } from '@midwayjs/core'
import { Context } from 'egg'
import { urlNamespace } from '@root/config/data'
import { IUserService } from '@root/service/user'
import { ApiProperty } from '@midwayjs/swagger'

class UserRegisterOptions {
    @ApiProperty({ example: '', description: '手机号' })
    mobile: string

    @ApiProperty({ example: '', description: 'The name of the Catage' })
    password: string

    @ApiProperty({ example: '', description: 'The name of the Catbreed' })
    username: string

    @ApiProperty({ example: '', description: 'The name of the Catbreed' })
    email: string
}

/**
 * 管理登录状态
 *
 * @export
 * @class LoginController
 */
@Provide()
@Controller(urlNamespace + '/login')
export class LoginController {
    @Inject()
    userService: IUserService

    @Inject()
    ctx: Context

    @Config('auth_cookie_name')
    auth_cookie_name

    /**
     * 注册
     *
     * @param {Context} ctx
     * @memberof LoginController
     */
    @Post('/register')
    async register(@Body() options: UserRegisterOptions) {
        const { mobile, password, username, email } = options

        // 错误处理
        const message = this.__errNotice({ mobile, password, username, email })
        if (message) {
            return this.ctx.throw(400, message)
        }

        // 注册成功返回体
        this.ctx.body = await this.userService.register({
            username,
            email,
            mobile,
            password,
        })
    }

    /**
     * 参数异常函数
     *
     * @private
     * @param {*} { mobile, password, code, username, email }
     * @returns
     * @memberof LoginController
     */
    private __errNotice({ mobile, password, username, email }) {
        // 参数校验
        let message = ''
        if (!mobile && !email) {
            message = '手机号或者邮箱不能为空'
        } else if (!username) {
            message = '用户名为空'
        } else if (!password) {
            message = '密码不能为空'
        }

        return message
    }
}
