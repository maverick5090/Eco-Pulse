/**
 * Navbar Injector - Dynamically loads and inserts the shared navbar.html
 * 
 * Usage in your HTML page:
 * 1. Add this before closing </head>: <script src="navbar-injector.js"></script>
 * 2. Add this at the start of <body>: <div id="navbar-container"></div>
 * 3. The navbar will be automatically injected with all functionality
 */

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch navbar.html
        const response = await fetch('navbar.html');
        const navbarHTML = await response.text();
        
        // Extract just the nav element
        const parser = new DOMParser();
        const doc = parser.parseFromString(navbarHTML, 'text/html');
        const navElement = doc.querySelector('nav.navbar');
        
        if (!navElement) {
            console.error('Could not find navbar element in navbar.html');
            return;
        }
        
        // Find container or create one at top of body
        let container = document.getElementById('navbar-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'navbar-container';
            document.body.insertBefore(container, document.body.firstChild);
        }
        
        // Insert navbar
        container.appendChild(navElement);
        
        // Extract and apply styles
        const styleElements = doc.querySelectorAll('style');
        styleElements.forEach(style => {
            const newStyle = document.createElement('style');
            newStyle.innerHTML = style.innerHTML;
            document.head.appendChild(newStyle);
        });
        
        // Extract and execute scripts
        const scriptElements = doc.querySelectorAll('script:not([src])');
        scriptElements.forEach(script => {
            const newScript = document.createElement('script');
            newScript.innerHTML = script.innerHTML;
            document.body.appendChild(newScript);
        });
        
        console.log('[NAVBAR] Navbar successfully injected');
        
    } catch (error) {
        console.error('[NAVBAR ERROR]', 'Failed to load navbar:', error);
    }
});
