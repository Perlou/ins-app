import { Config, Inject, Provide } from '@midwayjs/core'
import { IUserModel } from '@root/model/user'
import { v4 as uuidv4 } from 'uuid'

const jwt = require('jsonwebtoken')

export type IUserService = UserService

/**
 * 用户相关服务
 *
 * @export
 * @class UserService
 */
@Provide()
export class UserService {
    @Inject()
    private UserModel: IUserModel

    @Config('jwtSecret')
    private jwtSecret

    /**
     * 获取用户信息
     *
     * @param {string} userId
     * @returns
     * @memberof UserService
     */
    async getUserByUserId(userId: string) {
        return this.UserModel.findOne({ where: { userId } })
    }

    /**
     * 用户注册
     *
     * @param {Api.UserRegisterOptions} options
     * @returns
     * @memberof UserService
     */
    async register(options: API.UserRegisterOptions) {
        // 添加uuid
        options.userId = uuidv4().replace(/-/g, '')

        // 是否存在
        const queryResult = await this.hasRegister(options.email)

        if (queryResult) {
            return {
                status: 200,
                message: '邮箱已被使用',
                data: {
                    flag: false,
                },
            }
        }

        const userInfo = await this.UserModel.create(options)

        return {
            status: 200,
            message: '注册成功',
            data: {
                userId: userInfo.dataValues.userId,
                flag: true,
            },
        }
    }

    /**
     * 登录
     *
     * @param {Api.UserLoginOptions} options
     * @returns
     * @memberof UserService
     */
    async login(options: API.UserLoginOptions) {
        const existUser = await this.getUserByMail(options.email)

        // 用户不存在
        if (!existUser) {
            return null
        }

        const passhash = existUser.password
        // TODO: change to async compare
        const equal = passhash === options.password
        // 密码不匹配
        if (!equal) {
            return false
        }

        // 验证通过
        const token = jwt.sign({ userId: existUser.userId }, this.jwtSecret, {
            expiresIn: '7d',
        })
        return token
    }

    /**
     * 通过邮箱获取用户
     *
     * @param {string} email
     * @returns
     * @memberof UserService
     */
    async getUserByMail(email: string) {
        return this.UserModel.findOne({ where: { email } })
    }

    /**
     * 邮箱校验账号是否存在
     *
     * @private
     * @param {string} email
     * @returns
     * @memberof UserService
     */
    async hasRegister(email: string) {
        // 查询用户名
        const userInfo: any = await this.getUserByMail(email)

        if (userInfo && userInfo.dataValues.userId) {
            return true
        }
        return false
    }
}
