// js/app.js - The main SPA Router

// Store the currently active controller instance and style path
let currentController = null;
let currentStylePath = null;
const styleElement = document.getElementById('page-style');
const appRoot = document.getElementById('app-root');
const loadingIcon = document.getElementById('loading-icon');

/**
 * Defines the application routes.
 * Maps URL paths to views, controllers, and styles.
 */
const routes = {
    '/': {
        view: '/views/search.html',
        style: '/css/search_form.css',
        controllerPath: '/js/classes/SearchController.js',
        controllerName: 'SearchController'
    },
    '/login': {
        view: '/views/login.html',
        style: '/css/login.css',
        controllerPath: '/js/classes/LoginController.js',
        controllerName: 'LoginController'
    },
    '/register': {
        view: '/views/registration.html',
        style: '/css/registration.css',
        controllerPath: '/js/classes/RegistrationController.js',
        controllerName: 'RegistrationController'
    },
    '/my-tickets': {
        view: '/views/my-tickets.html',
style: '/css/my_tickets.css', // <--- ודא ששורה זו קיימת
        controllerPath: '/js/my_tickets.js',
        controllerName: 'myTickets' // Special name for non-class module
    },
    '/personal-details': {
        view: '/views/personal-details.html',
        style: null, // Uses global styles
        controllerPath: '/js/personal_details.js',
        controllerName: 'personalDetails' // Special name
    },
    '/database': {
        view: '/views/database.html',
        style: null, // Uses inline styles
        controllerPath: '/js/database.js',
        controllerName: 'database' // Special name
    },
    '/about': {
        view: '/views/about.html',
        style: null,
        controllerPath: null // Static page
    },
    '/check-in': {
        view: '/views/check-in.html',
        style: null,
        controllerPath: null // Static page
    },
    '/customer-service': {
        view: '/views/customer-service.html',
        style: null,
        controllerPath: null // Static page
    },
    '/terms': {
        view: '/views/terms.html',
        style: null,
        controllerPath: null // Static page
    }
};

/**
 * Fetches and loads a CSS stylesheet dynamically.
 */
async function loadStyle(path) {
    if (path === currentStylePath) {
        return; // Style is already loaded
    }

    // Always clear old styles
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

/**
 * Main navigation function.
 * Loads the view, style, and initializes the controller.
 */
const navigateTo = async (path) => {
    // 1. Find the route or default to '/'
    const route = routes[path] || routes['/'];
    
    // 2. Clean up the old controller (if it exists)
    if (currentController) {
        if (typeof currentController.destroy === 'function') {
            currentController.destroy();
        }
        currentController = null;
    }

    // 3. Show loading spinner
    loadingIcon.style.display = 'block';

    // 4. Load Style and View in parallel
    try {
        const [viewResponse] = await Promise.all([
            fetch(route.view),
            loadStyle(route.style)
        ]);

        if (!viewResponse.ok) throw new Error(`Failed to fetch view: ${route.view}`);

        // 5. Inject the new HTML content
        appRoot.innerHTML = await viewResponse.text();

        // 6. Load and initialize the new controller (if defined)
        if (route.controllerPath) {
            const module = await import(route.controllerPath);
            
            // Handle non-class modules that export an init() function
            if (route.controllerName === 'myTickets' || route.controllerName === 'personalDetails' || route.controllerName === 'database') {
                if (module.init) {
                    currentController = module; // Store the module itself
                    currentController.init();   // Call its init function
                }
            } else {
                // Standard class-based controller
                const ControllerClass = module[route.controllerName];
                if (ControllerClass) {
                    currentController = new ControllerClass();
                    currentController.init(); // Call the init method
                }
            }
        }
    } catch (err) {
        console.error('Error during navigation:', err);
        appRoot.innerHTML = `<h2>Error loading page</h2><p>${err.message}</p>`;
    } finally {
        // 7. Hide loading spinner
        loadingIcon.style.display = 'none';
    }
};

/**
 * Intercepts clicks on all links with a 'data-nav' attribute.
 */
document.body.addEventListener('click', event => {
    let target = event.target;
    // Handle clicks inside SVGs or other elements inside the <a> tag
    while (target && target !== document.body) {
        if (target.matches('a[data-nav]')) {
            event.preventDefault();
            const href = target.getAttribute('href');
            // Don't navigate if it's the same page
            if (href !== window.location.pathname) {
                history.pushState(null, null, href); // Update URL
                navigateTo(href); // Navigate
            }
            return;
        }
        target = target.parentElement;
    }
});

/**
 * Handles browser back/forward button clicks.
 */
window.addEventListener('popstate', () => {
    navigateTo(window.location.pathname);
});

/**
 * Initial load:
 * Navigate to the path currently in the browser's URL bar.
 */
document.addEventListener('DOMContentLoaded', () => {
    // We don't need 'DOMContentLoaded' for our app logic,
    // but we use it to trigger the *first* navigation.
    navigateTo(window.location.pathname);
});