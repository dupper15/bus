export const isJsonString = (data) => {
    try {
        JSON.parse(data)
        // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return false
    }
    return true
}
