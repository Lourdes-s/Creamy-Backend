export const createUserToken = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
})

export const createUserPublic = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    activo: user.activo,
    emailVerified: user.emailVerified,
    fecha_creacion: user.fecha_creacion
})