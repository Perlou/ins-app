
declare module API {
    interface UserRegisterOptions {
        username: string
        password: string
        mobile?: string
        email: string
        userId?: string
    }

    interface UserLoginOptions {
        email: string
        password: string
    }

    interface UserUpdateInfoOptions {
        userId: string
        email?: string
        password?: string
    }
}
