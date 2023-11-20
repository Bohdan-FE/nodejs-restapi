export const handleSaveError = (error, data, next) => {
    const { code, name } = error
    const status = (name === 'MongoServerError' && code === 11000) ? 409 : 400
    error.status = status
    next()
}

export function preUpdate(next) {
    this.options.new = true
    this.options.runValidators = true
    next()
}