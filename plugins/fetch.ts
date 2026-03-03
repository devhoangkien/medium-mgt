export default defineNuxtPlugin((nuxtApp) => {
    const token = useCookie('auth_token')

    const fetchWithAuth = $fetch.create({
        onRequest({ request, options }) {
            if (token.value) {
                options.headers = options.headers || {}
                // @ts-ignore
                options.headers.Authorization = `Bearer ${token.value}`
            }
        }
    })

    return {
        provide: {
            authFetch: fetchWithAuth
        }
    }
})
