
import { WebAuthnController } from './classes/LoginWebAuthnController.js'; 
import { logoutAPI } from './services/authService.js'; 
import { checkActivationStatus } from './services/searchService.js'; 
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
    
    // 1. Select the admin link
    const adminLink = document.getElementById('nav-admin-link');

    if (!loginBtn || !personalArea) return;

    const userEmail = localStorage.getItem('userEmail');
    // 2. Get the role from storage
    const userRole = localStorage.getItem('user_role'); 

    // Check if user is logged in
    const isLoggedIn = userEmail !== null;

    if (isLoggedIn) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        personalArea.style.display = 'block';
        logoutBtn.style.display = 'block';

        // 3. Admin Link Logic: Show only if role is 3
        if (adminLink) {
            // Using '==' to allow both string "3" and number 3
            if (userRole == 3) {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
        }

    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        personalArea.style.display = 'none';
        logoutBtn.style.display = 'none';
        
        // Hide admin link if not logged in
        if (adminLink) adminLink.style.display = 'none';
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

document.body.addEventListener('click', event => {
    let target = event.target;
    while (target && target !== document.body) {
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

document.body.addEventListener('click', async (event) => { 
    if (event.target.id === 'logout-button') {
        
        try {
            await logoutAPI();
            console.log("Server logout successful.");
            
        } catch (error) {
            console.error("Logout API failed, proceeding with local cleanup:", error);
        }
        
        localStorage.clear();

        history.pushState(null, null, '/login');
        navigateTo('/login');
    }
});

document.body.addEventListener('click', async (event) => {
    if (event.target.id === 'register-biometric-link') {
        event.preventDefault();

        const userEmail = localStorage.getItem('userEmail');

        if (!userEmail) {
            alert("לא נמצא משתמש מחובר. אנא התחבר מחדש.");
            history.pushState(null, null, '/login');
            navigateTo('/login');
            return;
        }

        console.log("Starting global biometric registration for:", userEmail);

        try {
            const webAuthn = new WebAuthnController({
                biometricStatus: null,
                emailInput: null
            }, null);

            await webAuthn.handleRegisterBiometric(userEmail);

        } catch (error) {
            console.error("Global biometric registration failed:", error);
        }
    }
});

window.addEventListener('popstate', () => {
    navigateTo(window.location.pathname);
});

async function initializeAppState() {
    const activationResult = await checkActivationStatus();

    if (activationResult.isLoggedIn) {
        if (activationResult.email) {
            localStorage.setItem('userEmail', activationResult.email);
        }
    } else {
        localStorage.clear();
    }
    
    navigateTo(window.location.pathname);
}
initializeAppState();