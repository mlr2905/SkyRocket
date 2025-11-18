// js/app.js - The main SPA Router

let currentController = null;
let currentStylePath = null;
const styleElement = document.getElementById('page-style');
const appRoot = document.getElementById('app-root');
const loadingIcon = document.getElementById('loading-icon');

const routes = {
    '/': { view: '/views/search.html', style: '/css/search_form.css', controllerPath: '/js/classes/SearchController.js', controllerName: 'SearchController' },
    '/login': { view: '/views/login.html', style: '/css/login.css', controllerPath: '/js/classes/LoginController.js', controllerName: 'LoginController' },
    '/register': { view: '/views/registration.html', style: '/css/registration.css', controllerPath: '/js/classes/RegistrationController.js', controllerName: 'RegistrationController' },
    '/my-tickets': { view: '/views/my-tickets.html', style: '/css/my_tickets.css', controllerPath: '/js/my_tickets.js', controllerName: 'myTickets' },
    '/personal-details': { view: '/views/personal-details.html', style: null, controllerPath: '/js/personal_details.js', controllerName: 'personalDetails' },
    '/database': { view: '/views/database.html', style: null, controllerPath: '/js/database.js', controllerName: 'database' },
    '/about': { view: '/views/about.html', style: null, controllerPath: null },
    '/check-in': { view: '/views/check-in.html', style: null, controllerPath: null },
    '/customer-service': { view: '/views/customer-service.html', style: null, controllerPath: null },
    '/terms': { view: '/views/terms.html', style: null, controllerPath: null }
};


export function updateNavbarAuth() {
    const loginBtn = document.getElementById('login-button');
    const signupBtn = document.getElementById('signup-button');
    const personalArea = document.getElementById('personal-area-dropdown');
    const logoutBtn = document.getElementById('logout-button');

    if (!loginBtn || !personalArea) return;

    // --- התיקון מתחיל כאן ---
    
    // בדיקה האם קיים מידע ב-LocalStorage (למשל user_id או user_data)
    // ודא שבפונקציית ההתחברות (LoginController) אתה אכן שומר את הנתון הזה!
// בתוך app.js -> updateNavbarAuth
const hasLocalStorageData = localStorage.getItem('userEmail') !== null;    
    // אופציונלי: בדיקת עוגייה רגילה (רק אם אתה בטוח שאתה יוצר עוגייה בשם 'token' שאינה HttpOnly)
    const hasTokenCookie = typeof Cookies !== 'undefined' && Cookies.get('token') !== undefined;

    const isLoggedIn = hasLocalStorageData || hasTokenCookie;
    
    // דיבוג לקונסול כדי שתראה בדיוק מה קורה בכל דף
    console.log('Auth Check:', { 
        page: window.location.pathname, 
        hasLocalStorage: hasLocalStorageData, 
        hasCookie: hasTokenCookie, 
        isLoggedIn: isLoggedIn 
    });

    // --- התיקון מסתיים כאן ---

    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        personalArea.style.display = 'block';
        logoutBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        personalArea.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

async function loadStyle(path) {
    if (path === currentStylePath) return;
    styleElement.innerHTML = '';
    currentStylePath = path;
    if (path) {
        try {
            const response = await fetch(path);
            const cssText = await response.text();
            styleElement.innerHTML = cssText;
        } catch (err) {
            console.error(`Failed to load style: ${path}`, err);
        }
    }
}

const navigateTo = async (path) => {
    const route = routes[path] || routes['/'];
    
    if (currentController) {
        if (typeof currentController.destroy === 'function') {
            currentController.destroy();
        }
        currentController = null;
    }

    // Update Navbar state on every navigation
    updateNavbarAuth();

    loadingIcon.style.display = 'block';

    try {
        const [viewResponse] = await Promise.all([
            fetch(route.view),
            loadStyle(route.style)
        ]);

        if (!viewResponse.ok) throw new Error(`Failed to fetch view: ${route.view}`);

        appRoot.innerHTML = await viewResponse.text();

        if (route.controllerPath) {
            const module = await import(route.controllerPath);
            
            if (['myTickets', 'personalDetails', 'database'].includes(route.controllerName)) {
                if (module.init) {
                    currentController = module;
                    currentController.init();
                }
            } else {
                const ControllerClass = module[route.controllerName];
                if (ControllerClass) {
                    currentController = new ControllerClass();
                    currentController.init();
                }
            }
        }
    } catch (err) {
        console.error('Error during navigation:', err);
        appRoot.innerHTML = `<h2>Error loading page</h2><p>${err.message}</p>`;
    } finally {
        loadingIcon.style.display = 'none';
    }
};

// Handle clicks on [data-nav] elements (both <a> and others)
document.body.addEventListener('click', event => {
    let target = event.target;
    while (target && target !== document.body) {
        // FIX: Removed 'a' prefix to support buttons or other elements if needed
        if (target.matches('[data-nav]')) {
            event.preventDefault();
            const href = target.getAttribute('href');
            if (href && href !== window.location.pathname) {
                history.pushState(null, null, href);
                navigateTo(href);
            }
            return;
        }
        target = target.parentElement;
    }
});

// Handle Logout Click
document.body.addEventListener('click', event => {
    if (event.target.id === 'logout-button') {
        // Clear Auth Data
        Cookies.remove('token'); 
        Cookies.remove('connect.sid');
        localStorage.clear(); // Optional: Clear local storage too
        
        // Redirect to home and update navbar
        history.pushState(null, null, '/');
        navigateTo('/');
    }
});

window.addEventListener('popstate', () => {
    navigateTo(window.location.pathname);
});

document.addEventListener('DOMContentLoaded', () => {
    navigateTo(window.location.pathname);
});