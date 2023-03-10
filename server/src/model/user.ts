import { providerWrapper } from '@midwayjs/core'
import {
    Column,
    CreatedAt,
    DataType,
    Model,
    Scopes,
    Table,
    UpdatedAt,
} from 'sequelize-typescript'

const { STRING, INTEGER } = DataType

export const factory = () => UserModel
providerWrapper([
    {
        id: 'UserModel',
        provider: factory,
    },
])

export type IUserModel = typeof UserModel

@Scopes({
    avaliable: {
        where: { status: 1 },
    },
})
@Table({
    freezeTableName: true,
    tableName: 'users',
})
export class UserModel extends Model<UserModel> {
    @Column({
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'users id',
    })
    id: number

    @Column({
        type: STRING(255),
        comment: '用户id',
    })
    userId: string

    @Column({
        type: STRING(255),
        allowNull: false,
        comment: '用户名',
    })
    username: string

    @Column({
        type: STRING(255),
        allowNull: false,
        comment: 'email',
    })
    email: string

    @Column({
        type: STRING(255),
        allowNull: false,
        comment: '密码',
    })
    password: string

    @Column(
        {
            type: STRING(255),
            allowNull: false,
            defaultValue:
                'https://s11.mogucdn.com/mlcdn/c45406/181105_60bdj928jdhjg9ehhg58hje1212ek_640x640.jpg',
            comment: '头像',
        } // 头像
    )
    avatarUrl: string

    @Column({
        type: STRING(32),
        comment: '手机号',
    })
    mobile: string

    @Column({
        type: STRING(32),
        comment: '手机号',
    })
    prefix: string

    @Column({
        type: STRING(255),
        comment: '自我介绍',
    })
    abstract: string

    @Column({
        type: STRING(2),
        defaultValue: '男',
        comment: '值为1时是男性，值为2时是女性，默认值为0时是未知',
    })
    sex: string

    @CreatedAt
    @Column({ field: 'created_at' })
    created_at: Date

    @UpdatedAt
    @Column({ field: 'updated_at' })
    updated_at: Date
}
