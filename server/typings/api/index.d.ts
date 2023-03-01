
declare module API {
    interface UserRegisterOptions {
        username: string
        password: string
        mobile?: number
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

export as namespace API
