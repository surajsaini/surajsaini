/* ==========================================
   SURAJ SAINI - PORTFOLIO SCRIPTS
   Vancouver | Software Quality Engineer
   ========================================== */

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            document.getElementById('navLinks').classList.remove('active');
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Scroll animations with Intersection Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Particle background
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 5 + 2;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const delay = Math.random() * 6;

        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.animationDelay = delay + 's';

        particlesContainer.appendChild(particle);
    }
}

// Initialize particles
createParticles();

// Add typing effect to the main title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const title = document.querySelector('.hero-text h1');
    if (title) {
        const originalText = title.textContent;
        setTimeout(() => {
            typeWriter(title, originalText, 150);
        }, 1000);
    }
});

// Mobile navigation toggle
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

initMobileNav();

// Animate numbers on scroll (for stats/highlights)
function animateNumbers() {
    const numbers = document.querySelectorAll('.highlight-item .number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalNumber = target.getAttribute('data-count');
                const suffix = target.getAttribute('data-suffix') || '';

                if (finalNumber) {
                    animateValue(target, 0, parseInt(finalNumber), 2000, suffix);
                }
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    numbers.forEach(num => observer.observe(num));
}

function animateValue(element, start, end, duration, suffix) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);

        element.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

animateNumbers();

// Timeline animation
function animateTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 200);
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => {
        item.classList.add('fade-in');
        observer.observe(item);
    });
}

animateTimeline();

// ==========================================
// PROJECTS CAROUSEL
// ==========================================
function initProjectsCarousel() {
    const carousel = document.querySelector('.projects-carousel');
    const track = document.querySelector('.projects-track');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!carousel || !track) return;

    const cards = track.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    let currentIndex = 0;
    let autoScrollInterval = null;
    const autoScrollDelay = 3000; // 3 seconds between auto-scrolls

    // Calculate card width including gap
    function getCardWidth() {
        const card = cards[0];
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap) || 24;
        return card.offsetWidth + gap;
    }

    // Calculate how many cards are visible
    function getVisibleCards() {
        const containerWidth = carousel.offsetWidth;
        const cardWidth = cards[0].offsetWidth;
        return Math.floor(containerWidth / cardWidth) || 1;
    }

    // Calculate max index
    function getMaxIndex() {
        const visibleCards = getVisibleCards();
        return Math.max(0, cards.length - visibleCards);
    }

    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        const maxIndex = getMaxIndex();

        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    // Update dots
    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    // Update arrow states
    function updateArrows() {
        const maxIndex = getMaxIndex();
        // For infinite-feel carousel, don't disable arrows - just loop
        prevBtn.style.opacity = '1';
        nextBtn.style.opacity = '1';
    }

    // Go to specific slide
    function goToSlide(index) {
        const maxIndex = getMaxIndex();

        // Loop around for infinite effect
        if (index < 0) {
            currentIndex = maxIndex;
        } else if (index > maxIndex) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        const offset = currentIndex * getCardWidth();
        track.style.transform = `translateX(-${offset}px)`;

        updateDots();
        updateArrows();
    }

    // Next slide
    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    // Previous slide
    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    // Start auto-scroll
    function startAutoScroll() {
        stopAutoScroll();
        autoScrollInterval = setInterval(nextSlide, autoScrollDelay);
    }

    // Stop auto-scroll
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    // Event listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoScroll(); // Reset timer after manual navigation
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoScroll(); // Reset timer after manual navigation
    });

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoScroll();
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoScroll();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide(); // Swipe left = next
            } else {
                prevSlide(); // Swipe right = prev
            }
        }
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createDots();
            goToSlide(Math.min(currentIndex, getMaxIndex()));
        }, 200);
    });

    // Initialize
    createDots();
    updateArrows();
    startAutoScroll();
}

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', initProjectsCarousel);

// Console easter egg
console.log('%c👋 Hello there, fellow developer!', 'font-size: 18px; font-weight: bold; color: #667eea;');
console.log('%cThanks for checking out my portfolio.', 'font-size: 14px; color: #764ba2;');
console.log('%c📧 Feel free to reach out: s2008saini@gmail.com', 'font-size: 12px; color: #666;');
