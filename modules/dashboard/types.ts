export interface User {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
    createdAt: Date
    updatedAt: Date
}

export interface Project {
    id: string
    title: string
    description: string | null
    template: string
    createdAt: Date
    updatedAt: Date
    userId: string
    user: User
    Starmark: { isMarked: boolean }[]
}