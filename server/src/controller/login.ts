import { Provide, Inject, Config } from '@midwayjs/core'
import { Context } from 'egg'
import { urlNamespace } from '@root/config/data'
import { IUserService } from '@root/service/user'
import { controller, post, Bodys } from '@root/decorator/openApi'

@Provide()
@controller(urlNamespace + '/login')
export class LoginController {
    @Inject()
    userService: IUserService

    @Inject()
    ctx: Context

    @Config('auth_cookie_name')
    auth_cookie_name

    @post('/register', {
        description: '注册',
        responses: 'string',
    })
    async register(
        @Bodys('API.UserRegisterOptions')
        input: API.UserRegisterOptions
    ) {
        const { mobile, password, username, email } = input

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

    @post('/', {
        description: '登录',
    })
    async login(
        @Bodys('API.UserLoginOptions')
        input: API.UserLoginOptions
    ) {
        const { password, email } = input

        // 登录
        const token = await this.userService.login({ password, email })

        // set cookie
        if (token) {
            // id存入Cookie, 用于验证过期.
            const opts = {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 30,
                // maxAge: 1000 * 40,
                // signed: true,
                httpOnly: false,
                domain: '127.0.0.1',
            }
            this.ctx.cookies.set(this.auth_cookie_name, token, opts) // cookie 有效期30天
            this.ctx.body = {
                status: 200,
                message: '登录成功',
                data: {
                    flag: true,
                },
            }
        } else {
            this.ctx.throw(400, '用户名或密码错误')
        }
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
