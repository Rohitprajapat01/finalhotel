// Gallery images data with local paths
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
let imageCache = new Map(); // Image cache for better performance

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

// Image loading optimization functions
function createImageWithFallback(src, alt = '') {
    return new Promise((resolve, reject) => {
        // Check cache first
        if (imageCache.has(src)) {
            resolve(imageCache.get(src));
            return;
        }

        const img = new Image();
        
        img.onload = () => {
            imageCache.set(src, img);
            img.classList.add('loaded');
            resolve(img);
        };
        
        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            // Create placeholder or hide element
            img.style.display = 'none';
            reject(new Error(`Image failed to load: ${src}`));
        };
        
        img.src = src;
        img.alt = alt;
    });
}

// Preload images with retry mechanism
function preloadImage(src, retries = 3) {
    return new Promise((resolve, reject) => {
        const attemptLoad = (attempt) => {
            createImageWithFallback(src)
                .then(resolve)
                .catch(() => {
                    if (attempt < retries) {
                        setTimeout(() => attemptLoad(attempt + 1), 1000 * attempt);
                    } else {
                        reject(new Error(`Failed to load after ${retries} attempts: ${src}`));
                    }
                });
        };
        attemptLoad(1);
    });
}

// Batch preload images
function preloadImages(imagePaths) {
    const promises = imagePaths.map(path => preloadImage(path));
    return Promise.allSettled(promises);
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

// Gallery Modal Functions with optimized image loading
function openModal(index) {
    if (index >= 0 && index < galleryImages.length) {
        currentImageIndex = index;
        updateModalContent();
        galleryModal.classList.add('show');
        document.body.classList.add('modal-open');
        
        // Preload adjacent images for smoother navigation
        preloadAdjacentImages(index);
        
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
        
        // Show loading state
        modalImage.style.opacity = '0.5';
        modalTitle.textContent = 'Loading...';
        modalCategory.textContent = '';
        
        // Load image with optimization
        createImageWithFallback(image.url, image.title)
            .then(() => {
                modalImage.src = image.url;
                modalImage.alt = image.title;
                modalTitle.textContent = image.title;
                modalCategory.textContent = image.category;
                modalImage.style.opacity = '1';
            })
            .catch(() => {
                modalTitle.textContent = 'Image not available';
                modalCategory.textContent = image.category;
                modalImage.style.opacity = '1';
            });
    }
}

function preloadAdjacentImages(currentIndex) {
    const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    
    // Preload previous and next images
    preloadImage(galleryImages[prevIndex].url).catch(() => {});
    preloadImage(galleryImages[nextIndex].url).catch(() => {});
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateModalContent();
    preloadAdjacentImages(currentImageIndex);
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateModalContent();
    preloadAdjacentImages(currentImageIndex);
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

// Hero Image Slider with optimized loading
function initHeroSlider() {
    const heroSliderContainer = document.getElementById('heroNewImageSlider');
    if (!heroSliderContainer) return;

    heroSlides = Array.from(heroSliderContainer.querySelectorAll('.new-slide-image'));
    
    if (heroSlides.length > 1) {
        // Preload all hero images
        const heroImagePaths = heroSlides.map(slide => slide.src);
        preloadImages(heroImagePaths).then(() => {
            console.log('Hero images preloaded');
        });
        
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

// Intersection Observer for scroll animations and lazy loading
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it's an image, ensure it's loaded
                if (entry.target.tagName === 'IMG') {
                    optimizeImageLoading(entry.target);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll(
        'section:not(#home), .room-card, .gallery-item, .info-card, .contact-card, .booking-card, img[loading="lazy"]'
    );
    
    elementsToAnimate.forEach(el => observer.observe(el));
}

// Optimize image loading for individual images
function optimizeImageLoading(img) {
    if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
        return;
    }
    
    const originalSrc = img.src;
    img.style.opacity = '0.5';
    
    createImageWithFallback(originalSrc, img.alt)
        .then(() => {
            img.style.opacity = '1';
            img.classList.add('loaded');
        })
        .catch(() => {
            img.style.opacity = '0.3';
            img.alt = 'Image not available';
        });
}

// Enhanced lazy loading for images
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    optimizeImageLoading(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px' // Start loading 50px before the image comes into view
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => optimizeImageLoading(img));
    }
}

// Preload critical images with local paths
function preloadCriticalImages() {
    const criticalImages = [
        'fttemple.jpg',
        '11.jpg',
        '12.jpg',
        'nonac.jpg'
    ];
    
    preloadImages(criticalImages).then((results) => {
        const successful = results.filter(result => result.status === 'fulfilled').length;
        console.log(`Preloaded ${successful}/${criticalImages.length} critical images`);
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

// Initialize gallery functionality with image optimization
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
        
        // Optimize gallery item images
        const img = item.querySelector('img');
        if (img) {
            optimizeImageLoading(img);
        }
    });

    // Modal close on backdrop click
    if (galleryModal) {
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                closeModal();
            }
        });
    }
    
    // Preload gallery images on hover for better UX
    galleryItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            preloadImage(galleryImages[index].url).catch(() => {});
        }, { once: true });
    });
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
                
                // Log image cache statistics
                console.log(`Images cached: ${imageCache.size}`);
            }, 0);
        });
    }
}

// Enhanced error handling for images
function handleImageErrors() {
    document.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            console.warn('Image failed to load:', e.target.src);
            
            // Add error class for styling
            e.target.classList.add('image-error');
            
            // Try to reload the image once after a delay
            setTimeout(() => {
                if (!e.target.complete) {
                    const originalSrc = e.target.src;
                    e.target.src = '';
                    e.target.src = originalSrc;
                }
            }, 2000);
        }
    }, true);
}

// Image loading progress indicator
function showImageLoadingProgress() {
    const totalImages = document.querySelectorAll('img').length;
    let loadedImages = 0;
    
    const updateProgress = () => {
        loadedImages++;
        const progress = (loadedImages / totalImages) * 100;
        console.log(`Image loading progress: ${Math.round(progress)}%`);
        
        if (loadedImages === totalImages) {
            console.log('All images loaded');
        }
    };
    
    document.querySelectorAll('img').forEach(img => {
        if (img.complete) {
            updateProgress();
        } else {
            img.addEventListener('load', updateProgress, { once: true });
            img.addEventListener('error', updateProgress, { once: true });
        }
    });
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
    handleImageErrors();
    
    // Preload critical images after initial load
    setTimeout(() => {
        preloadCriticalImages();
        showImageLoadingProgress();
    }, 1000);
    
    // Set initial scroll state
    setTimeout(handleScroll, 100);
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Performance monitoring in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
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
    
    // Clear image cache to free memory
    imageCache.clear();
});

// Network status monitoring for image loading optimization
if ('navigator' in window && 'onLine' in navigator) {
    window.addEventListener('online', () => {
        console.log('Network connection restored');
        // Retry failed image loads
        document.querySelectorAll('img.image-error').forEach(img => {
            optimizeImageLoading(img);
        });
    });
    
    window.addEventListener('offline', () => {
        console.log('Network connection lost');
    });
}
