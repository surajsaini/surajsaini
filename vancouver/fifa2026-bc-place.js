// ===== Dark Mode Toggle =====
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const themeKey = 'fifa2026-theme';

// Initialize theme from localStorage or system preference
function initializeTheme() {
    const savedTheme = localStorage.getItem(themeKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(theme);
}

function setTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem(themeKey, theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

initializeTheme();

// ===== Countdown Timers =====
function updateCountdowns() {
    const countdownElements = document.querySelectorAll('.countdown');
    
    countdownElements.forEach(element => {
        const targetDate = new Date(element.getAttribute('data-target')).getTime();
        
        function updateTimer() {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                element.textContent = '⏰ Match Starting Soon!';
                element.style.background = '#28a745';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            element.textContent = `⏱️ ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
        
        updateTimer();
        setInterval(updateTimer, 1000);
    });
}

updateCountdowns();

// ===== Scroll to Top Button =====
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && scrollToTopBtn.classList.contains('show')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ===== Schema.org Structured Data =====
const schemaData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "FIFA World Cup 2026",
    "description": "FIFA World Cup 2026 matches at BC Place Vancouver",
    "location": {
        "@type": "Place",
        "name": "BC Place Stadium",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "777 Pacific Boulevard",
            "addressLocality": "Vancouver",
            "addressRegion": "BC",
            "postalCode": "V6B 4Y8",
            "addressCountry": "CA"
        }
    },
    "startDate": "2026-06-13",
    "endDate": "2026-07-07",
    "eventStatus": "EventScheduled",
    "eventAttendanceMode": "OfflineEventAttendanceMode"
};

// Add structured data to page
const script = document.createElement('script');
script.type = 'application/ld+json';
script.textContent = JSON.stringify(schemaData);
document.head.appendChild(script);

// ===== Analytics Event Tracking =====
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track link clicks
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', () => {
        trackEvent('external_link', 'click', link.href);
    });
});

// ===== Accessibility Enhancements =====
// Skip to main content
const skipLink = document.createElement('a');
skipLink.href = '#matches';
skipLink.textContent = 'Skip to main content';
skipLink.className = 'sr-only';
skipLink.style.position = 'absolute';
skipLink.style.top = '-40px';
skipLink.style.left = 0;
skipLink.style.background = '#667eea';
skipLink.style.color = 'white';
skipLink.style.padding = '8px';
skipLink.style.zIndex = '100';

skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});

skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);
