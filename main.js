/* ===================================
   Suzanne Maria Kern - Main JavaScript
   Mit Accessibility-Verbesserungen
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initHeaderScroll();
    initScrollReveal();
    initSmoothScroll();
    initBookingModal();
    initFormValidation();
    initLazyLoading();
    initReducedMotion();
});

/* ===================================
   Reduced Motion Support
   =================================== */
function initReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function handleReducedMotion() {
        if (prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--transition-base', '0.01s');
            document.documentElement.style.setProperty('--transition-slow', '0.01s');
            document.documentElement.style.setProperty('--transition-fast', '0.01s');
        }
    }
    
    handleReducedMotion();
    prefersReducedMotion.addEventListener('change', handleReducedMotion);
}

/* ===================================
   Mobile Menu with Accessibility
   =================================== */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!menuToggle || !mobileMenu) return;
    
    // Set initial ARIA states
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-controls', 'mobileMenu');
    mobileMenu.setAttribute('aria-hidden', 'true');
    
    // Toggle menu function
    const toggleMenu = (forceClose = false) => {
        const isCurrentlyActive = menuToggle.classList.contains('active');
        const shouldClose = forceClose || isCurrentlyActive;
        
        if (shouldClose) {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            menuToggle.focus(); // Return focus to toggle button
        } else {
            menuToggle.classList.add('active');
            mobileMenu.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
            mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus first menu link
            const firstLink = mobileMenu.querySelector('a');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        }
    };
    
    menuToggle.addEventListener('click', () => toggleMenu());
    
    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            toggleMenu(true);
        }
    });
    
    // Trap focus within mobile menu when open
    mobileMenu.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        
        const focusableElements = mobileMenu.querySelectorAll(
            'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    });
}

/* ===================================
   Header Scroll Effect
   =================================== */
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    
    let lastScroll = 0;
    let ticking = false;
    
    const updateHeader = () => {
        const currentScroll = window.pageYOffset;
        header.classList.toggle('scrolled', currentScroll > 50);
        lastScroll = currentScroll;
        ticking = false;
    };
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
}

/* ===================================
   Scroll Reveal Animation
   =================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    if (revealElements.length === 0) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealElements.forEach(el => el.classList.add('visible'));
        return;
    }
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => observer.observe(el));
}

/* ===================================
   Smooth Scroll for Anchor Links
   =================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.getElementById('header')?.offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                // Check for reduced motion preference
                const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches 
                    ? 'auto' 
                    : 'smooth';
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: behavior
                });
                
                // Set focus to target for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });
}

/* ===================================
   Booking Modal with Accessibility
   =================================== */
let lastFocusedElement = null;

function initBookingModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('bookingModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'bookingModal';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modalTitle');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Dialog schließen" type="button">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
                <div class="modal-header">
                    <h3 id="modalTitle">Kurs buchen</h3>
                </div>
                <div class="modal-body">
                    <div id="modalCourseInfo"></div>
                    <form id="bookingForm" class="booking-form" novalidate>
                        <div class="form-group">
                            <label for="bookingName">Name *</label>
                            <input type="text" id="bookingName" name="name" required aria-required="true" autocomplete="name">
                        </div>
                        <div class="form-group">
                            <label for="bookingEmail">E-Mail *</label>
                            <input type="email" id="bookingEmail" name="email" required aria-required="true" autocomplete="email">
                        </div>
                        <div class="form-group">
                            <label for="bookingPhone">Telefon</label>
                            <input type="tel" id="bookingPhone" name="phone" autocomplete="tel">
                        </div>
                        <div class="form-group">
                            <label for="bookingMessage">Nachricht</label>
                            <textarea id="bookingMessage" name="message" rows="3"></textarea>
                        </div>
                        <div class="form-group checkbox">
                            <input type="checkbox" id="bookingPrivacy" name="privacy" required aria-required="true">
                            <label for="bookingPrivacy">Ich habe die <a href="https://suzannekern.de/datenschutz/" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a> gelesen und akzeptiere sie. *</label>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <span>Buchungsanfrage senden</span>
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add modal styles
        addModalStyles();
    }
    
    const modalContent = modal.querySelector('.modal-content');
    
    // Open modal function
    const openModal = (triggerElement) => {
        lastFocusedElement = triggerElement || document.activeElement;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus first input after animation
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, button');
            if (firstInput) firstInput.focus();
        }, 100);
    };
    
    // Close modal function
    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Return focus to trigger element
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };
    
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Focus trap within modal
    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab' || !modal.classList.contains('active')) return;
        
        const focusableElements = modalContent.querySelectorAll(
            'button, input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    });
    
    // Booking form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!this.checkValidity()) {
                // Show validation errors
                this.querySelectorAll(':invalid').forEach(field => {
                    field.classList.add('error');
                    field.setAttribute('aria-invalid', 'true');
                });
                return;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Wird gesendet...</span>';
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
            
            setTimeout(() => {
                // Show success message
                const modalBody = modal.querySelector('.modal-body');
                modalBody.innerHTML = `
                    <div class="booking-success" role="alert" aria-live="polite">
                        <div class="success-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                <path d="M22 4L12 14.01l-3-3"/>
                            </svg>
                        </div>
                        <h4>Vielen Dank!</h4>
                        <p>Deine Buchungsanfrage wurde erfolgreich gesendet. Suzanne wird sich in Kürze bei Dir melden.</p>
                        <button class="btn btn-outline" type="button" id="closeSuccessBtn">
                            Schließen
                        </button>
                    </div>
                `;
                
                // Add event listener to new close button
                document.getElementById('closeSuccessBtn').addEventListener('click', closeModal);
                document.getElementById('closeSuccessBtn').focus();
            }, 1500);
        });
    }
    
    // Book buttons - open modal
    document.querySelectorAll('[data-book]').forEach(btn => {
        btn.addEventListener('click', function() {
            const courseData = this.dataset;
            const courseInfo = document.getElementById('modalCourseInfo');
            
            if (courseInfo) {
                courseInfo.innerHTML = `
                    <div class="course-info-card">
                        <strong>${courseData.courseName || 'Kurs'}</strong>
                        <span>${courseData.courseTime || ''} ${courseData.courseLocation || ''}</span>
                    </div>
                `;
            }
            
            openModal(this);
        });
    });
}

function addModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            position: fixed;
            inset: 0;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }
        
        .modal.active {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
        }
        
        .modal-content {
            position: relative;
            background: var(--color-white);
            border-radius: var(--radius-xl);
            max-width: 480px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            transform: translateY(20px);
            transition: transform 0.3s;
        }
        
        .modal.active .modal-content {
            transform: translateY(0);
        }
        
        .modal-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-sand);
            border: none;
            border-radius: var(--radius-full);
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .modal-close:hover,
        .modal-close:focus {
            background: var(--color-border);
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }
        
        .modal-close svg {
            width: 20px;
            height: 20px;
        }
        
        .modal-header {
            padding: var(--space-lg);
            border-bottom: 1px solid var(--color-border);
        }
        
        .modal-header h3 {
            margin: 0;
        }
        
        .modal-body {
            padding: var(--space-lg);
        }
        
        .course-info-card {
            display: flex;
            flex-direction: column;
            padding: var(--space-md);
            background: var(--color-sand);
            border-radius: var(--radius-md);
            margin-bottom: var(--space-lg);
        }
        
        .course-info-card strong {
            color: var(--color-primary);
        }
        
        .course-info-card span {
            font-size: 0.875rem;
            color: var(--color-text-light);
        }
        
        .booking-form .form-group {
            margin-bottom: var(--space-md);
        }
        
        .booking-form label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: var(--space-xs);
        }
        
        .booking-form input,
        .booking-form textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            font-family: var(--font-body);
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .booking-form input:focus,
        .booking-form textarea:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(0, 53, 128, 0.15);
        }
        
        .booking-form input.error,
        .booking-form textarea.error {
            border-color: #e74c3c;
            background-color: #fdf2f2;
        }
        
        .booking-form input[aria-invalid="true"],
        .booking-form textarea[aria-invalid="true"] {
            border-color: #e74c3c;
        }
        
        .form-group.checkbox {
            display: flex;
            gap: var(--space-xs);
            align-items: flex-start;
        }
        
        .form-group.checkbox input {
            width: auto;
            margin-top: 4px;
        }
        
        .form-group.checkbox label {
            font-size: 0.8125rem;
            font-weight: 400;
            margin-bottom: 0;
        }
        
        .form-group.checkbox a {
            color: var(--color-primary);
            text-decoration: underline;
        }
        
        .booking-success {
            text-align: center;
            padding: var(--space-lg);
        }
        
        .success-icon {
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-sage);
            border-radius: var(--radius-full);
            margin: 0 auto var(--space-md);
        }
        
        .success-icon svg {
            width: 32px;
            height: 32px;
            stroke: var(--color-white);
        }
        
        .booking-success h4 {
            margin-bottom: var(--space-sm);
        }
        
        .booking-success p {
            color: var(--color-text-light);
            margin-bottom: var(--space-lg);
        }
        
        /* Focus visible styles for better keyboard navigation */
        .modal-content :focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
}

/* ===================================
   Form Validation with Accessibility
   =================================== */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Add novalidate to use custom validation
        form.setAttribute('novalidate', '');
        
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            let firstError = null;
            
            requiredFields.forEach(field => {
                // Clear previous error state
                field.classList.remove('error');
                field.removeAttribute('aria-invalid');
                field.removeAttribute('aria-describedby');
                
                // Remove existing error message
                const existingError = field.parentNode.querySelector('.error-message');
                if (existingError) existingError.remove();
                
                if (!field.value.trim()) {
                    isValid = false;
                    setFieldError(field, 'Dieses Feld ist erforderlich.');
                    if (!firstError) firstError = field;
                } else if (field.type === 'email' && field.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(field.value)) {
                        isValid = false;
                        setFieldError(field, 'Bitte gib eine gültige E-Mail-Adresse ein.');
                        if (!firstError) firstError = field;
                    }
                } else if (field.type === 'checkbox' && !field.checked) {
                    isValid = false;
                    setFieldError(field, 'Bitte akzeptiere die Datenschutzerklärung.');
                    if (!firstError) firstError = field;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                if (firstError) {
                    firstError.focus();
                    // Announce error to screen readers
                    announceToScreenReader('Bitte korrigiere die Fehler im Formular.');
                }
            }
        });
        
        // Remove error on input
        form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('input', () => {
                field.classList.remove('error');
                field.removeAttribute('aria-invalid');
                const errorMsg = field.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
        });
    });
    
    // Add error styles
    const style = document.createElement('style');
    style.textContent = `
        input.error,
        textarea.error {
            border-color: #e74c3c !important;
            background-color: #fdf2f2;
        }
        
        .error-message {
            color: #e74c3c;
            font-size: 0.8125rem;
            margin-top: 0.25rem;
        }
    `;
    document.head.appendChild(style);
}

function setFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    const errorId = field.id + '-error';
    field.setAttribute('aria-describedby', errorId);
    
    const errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    errorEl.id = errorId;
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = message;
    
    field.parentNode.appendChild(errorEl);
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => announcement.remove(), 1000);
}

/* ===================================
   Lazy Loading Images
   =================================== */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if (lazyImages.length === 0) return;
    
    // Check for native lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        });
        return;
    }
    
    // Fallback to Intersection Observer
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px'
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

/* ===================================
   Course Filter (for kurse.html)
   =================================== */
function initCourseFilter() {
    const filterBtns = document.querySelectorAll('[data-filter]');
    const courses = document.querySelectorAll('[data-category]');
    
    if (filterBtns.length === 0) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button and aria-pressed
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            // Filter courses
            let visibleCount = 0;
            courses.forEach(course => {
                if (filter === 'all' || course.dataset.category === filter) {
                    course.style.display = '';
                    course.classList.add('visible');
                    visibleCount++;
                } else {
                    course.style.display = 'none';
                    course.classList.remove('visible');
                }
            });
            
            // Announce result to screen readers
            announceToScreenReader(`${visibleCount} Kurse werden angezeigt.`);
        });
    });
}

/* ===================================
   Calendar Integration (for kurse.html)
   =================================== */
function addToCalendar(event) {
    const { title, date, time, location, description } = event;
    
    // Format for Google Calendar
    const startDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(startDate.getTime() + 75 * 60000); // 75 minutes
    
    const formatDate = (d) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&location=${encodeURIComponent(location)}&details=${encodeURIComponent(description)}`;
    
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
}

/* ===================================
   Blog Search (for blog.html)
   =================================== */
function initBlogSearch() {
    const searchInput = document.getElementById('blogSearch');
    const blogPosts = document.querySelectorAll('.blog-post');
    
    if (!searchInput) return;
    
    // Debounce search for performance
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
            const query = this.value.toLowerCase().trim();
            let visibleCount = 0;
            
            blogPosts.forEach(post => {
                const title = post.querySelector('h2, h3')?.textContent.toLowerCase() || '';
                const content = post.querySelector('p')?.textContent.toLowerCase() || '';
                const category = post.dataset.category?.toLowerCase() || '';
                
                const matches = !query || title.includes(query) || content.includes(query) || category.includes(query);
                post.style.display = matches ? '' : 'none';
                if (matches) visibleCount++;
            });
            
            // Announce results to screen readers
            if (query) {
                announceToScreenReader(`${visibleCount} Artikel gefunden für "${query}".`);
            }
        }, 300);
    });
}

/* ===================================
   Newsletter Signup
   =================================== */
function initNewsletterSignup() {
    const form = document.getElementById('newsletterForm');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const submitBtn = this.querySelector('button[type="submit"]');
        
        if (!emailInput.value) return;
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            setFieldError(emailInput, 'Bitte gib eine gültige E-Mail-Adresse ein.');
            emailInput.focus();
            return;
        }
        
        // Simulate submission
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.innerHTML = 'Wird angemeldet...';
        
        setTimeout(() => {
            form.innerHTML = `
                <div class="newsletter-success" role="alert" aria-live="polite">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                    <p>Vielen Dank! Du erhältst in Kürze eine Bestätigungsmail.</p>
                </div>
            `;
        }, 1500);
    });
}

/* ===================================
   Testimonials Slider
   =================================== */
function initTestimonialsSlider() {
    const slider = document.querySelector('.testimonials-slider');
    
    if (!slider) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('grabbing');
        slider.setAttribute('aria-grabbed', 'true');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('grabbing');
        slider.setAttribute('aria-grabbed', 'false');
    });
    
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('grabbing');
        slider.setAttribute('aria-grabbed', 'false');
    });
    
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });
    
    // Keyboard navigation for slider
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-label', 'Kundenstimmen, horizontal scrollbar');
    
    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            slider.scrollBy({ left: -300, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
            slider.scrollBy({ left: 300, behavior: 'smooth' });
        }
    });
}

/* ===================================
   Utility Functions
   =================================== */

// Debounce function
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

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format date in German
function formatDate(dateString) {
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('de-DE', options);
}

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Pre-fill form based on URL params
function prefillForm() {
    const params = getUrlParams();
    
    if (params.event) {
        const interestSelect = document.getElementById('interest');
        if (interestSelect) {
            interestSelect.value = 'retreat';
        }
        
        const messageField = document.getElementById('message');
        if (messageField && params.event) {
            const eventNames = {
                'neuanfang': 'Die Magie des Neuanfangs (10. Januar 2026)',
                'rise': 'RiseSisterRise (7. März 2026)',
                'lappland': 'Lappland Wanderreise (2.-8. August 2026)',
                'italien': 'Italien Retreat (29. Sept. - 3. Okt. 2026)'
            };
            messageField.value = `Ich interessiere mich für: ${eventNames[params.event] || params.event}`;
        }
    }
}

// Initialize pre-fill on contact page
if (window.location.pathname.includes('kontakt')) {
    document.addEventListener('DOMContentLoaded', prefillForm);
}

/* ===================================
   Skip Link Focus Fix
   =================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Handle skip link focus for better keyboard navigation
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    skipLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });
});
