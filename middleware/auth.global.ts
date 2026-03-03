export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('auth_token')

    // Routes that do not require authentication
    const isPublicRoute = to.path.startsWith('/auth')

    if (!token.value && !isPublicRoute) {
        // Redirect to login page if token doesn't exist
        return navigateTo('/auth/login')
    }

    if (token.value && isPublicRoute) {
        // Redirect to dashboard if logged in but trying to access auth pages
        return navigateTo('/')
    }
})
