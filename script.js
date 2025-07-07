// Gallery images data with Pexels URLs
const galleryImages = [
    { url: '12.jpg', title: 'Hotel Exterior', category: 'Garden' },
    { url: 'fttemple.jpg', title: 'Nearby Places', category: 'Temple' },
    { url: '11.jpg', title: 'Nearby Places', category: 'Temple' },
    { url: '13.jpg', title: 'Hotel Exterior', category: 'Exterior' },
    { url: 'vip.jpg', title: 'Deluxe Suite', category: 'Rooms' },
    { url: '14.jpg', title: 'Garden', category: 'Amenities' },
    { url: 'templeview.jpg', title: 'Nearby Attractions', category: 'Temple' },
    { url: '3bed.jpg', title: 'Family Suite', category: 'Rooms' }
];

// Cache DOM elements for better performance
let header, mobileMenuBtn, nav, floatingBtn, floatingOptions, galleryModal, modalImage, modalTitle, modalCategory;
let currentImageIndex = 0;
let heroSlideIndex = 0;
let heroSlides = [];
let heroSliderInterval;

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll function with offset for fixed header
function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        const headerHeight = header ? header.offsetHeight : 80;
        const targetPosition = section.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (nav && nav.classList.contains('show')) {
            toggleMobileMenu();
        }
    }
}

// Mobile menu toggle with improved animation
function toggleMobileMenu() {
    if (nav && mobileMenuBtn) {
        const isOpen = nav.classList.contains('show');
        
        if (isOpen) {
            nav.classList.remove('show');
            mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            nav.classList.add('show');
            mobileMenuBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

// Gallery Modal Functions
function openModal(index) {
    if (index >= 0 && index < galleryImages.length) {
        currentImageIndex = index;
        updateModalContent();
        galleryModal.classList.add('show');
        document.body.classList.add('modal-open');
        
        // Add keyboard event listener
        document.addEventListener('keydown', handleModalKeydown);
    }
}

function closeModal() {
    galleryModal.classList.remove('show');
    document.body.classList.remove('modal-open');
    
    // Remove keyboard event listener
    document.removeEventListener('keydown', handleModalKeydown);
}

function updateModalContent() {
    if (currentImageIndex >= 0 && currentImageIndex < galleryImages.length) {
        const image = galleryImages[currentImageIndex];
        modalImage.src = image.url;
        modalImage.alt = image.title;
        modalTitle.textContent = image.title;
        modalCategory.textContent = image.category;
    }
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateModalContent();
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateModalContent();
}

// Handle keyboard navigation in modal
function handleModalKeydown(e) {
    switch(e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
    }
}

// Hero Image Slider
function initHeroSlider() {
    const heroSliderContainer = document.getElementById('heroNewImageSlider');
    if (!heroSliderContainer) return;

    heroSlides = Array.from(heroSliderContainer.querySelectorAll('.new-slide-image'));
    
    if (heroSlides.length > 1) {
        showHeroSlide(heroSlideIndex);
        heroSliderInterval = setInterval(() => {
            heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
            showHeroSlide(heroSlideIndex);
        }, 5000);
    }
}

function showHeroSlide(index) {
    heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active-new-slide', i === index);
    });
}

// Header scroll effect with throttling
const handleScroll = throttle(() => {
    if (!header) return;
    
    const scrolled = window.scrollY > 50;
    header.classList.toggle('scrolled', scrolled);
}, 16); // ~60fps

// Intersection Observer for scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll(
        'section:not(#home), .room-card, .gallery-item, .info-card, .contact-card, .booking-card'
    );
    
    elementsToAnimate.forEach(el => observer.observe(el));
}

// Lazy loading for images
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.onload = () => img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => img.classList.add('loaded'));
    }
}

// Preload critical images
function preloadCriticalImages() {
    const criticalImages = [
        'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
        'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize floating contact functionality
function initFloatingContact() {
    if (!floatingBtn || !floatingOptions) return;
    
    floatingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        floatingOptions.classList.toggle('show');
        floatingBtn.classList.toggle('active');
    });

    // Close floating options when clicking outside
    document.addEventListener('click', (e) => {
        if (!floatingBtn.contains(e.target) && !floatingOptions.contains(e.target)) {
            floatingOptions.classList.remove('show');
            floatingBtn.classList.remove('active');
        }
    });
}

// Initialize gallery functionality
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openModal(index));
        
        // Add keyboard support
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(index);
            }
        });
    });

    // Modal close on backdrop click
    if (galleryModal) {
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                closeModal();
            }
        });
    }
}

// Handle window resize
const handleResize = debounce(() => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && nav && nav.classList.contains('show')) {
        toggleMobileMenu();
    }
}, 250);

// Performance monitoring
function logPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            }, 0);
        });
    }
}

// Error handling for images
function handleImageErrors() {
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            console.warn('Image failed to load:', e.target.src);
            e.target.style.display = 'none';
        }
    }, true);
}

// Main initialization function
function init() {
    // Cache DOM elements
    header = document.getElementById('header');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    nav = document.getElementById('nav');
    floatingBtn = document.getElementById('floatingBtn');
    floatingOptions = document.getElementById('floatingOptions');
    galleryModal = document.getElementById('galleryModal');
    modalImage = document.getElementById('modalImage');
    modalTitle = document.getElementById('modalTitle');
    modalCategory = document.getElementById('modalCategory');

    // Initialize all functionality
    initHeroSlider();
    initScrollAnimations();
    initLazyLoading();
    initFloatingContact();
    initGallery();
    preloadCriticalImages();
    handleImageErrors();
    
    // Set initial scroll state
    setTimeout(handleScroll, 100);
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Performance monitoring in development
    if (window.location.hostname === 'localhost') {
        logPerformance();
    }

    // Expose functions to global scope for inline event handlers
    window.scrollToSection = scrollToSection;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.prevImage = prevImage;
    window.nextImage = nextImage;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (heroSliderInterval) {
        clearInterval(heroSliderInterval);
    }
});