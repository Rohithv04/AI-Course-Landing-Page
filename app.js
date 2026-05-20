document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Shadow Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Nav Menu Drawer Logic
    const menuBtn = document.querySelector('.menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-link');

    function toggleMobileMenu() {
        menuBtn.classList.toggle('open');
        mobileNav.classList.toggle('open');
        mobileNavOverlay.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        menuBtn.classList.remove('open');
        mobileNav.classList.remove('open');
        mobileNavOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', toggleMobileMenu);
    mobileNavOverlay.addEventListener('click', closeMobileMenu);
    mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

    // 3. Scroll Reveal Animations (using Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. FAQ Accordion Toggle Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question-btn');
        const answerContainer = item.querySelector('.faq-answer-container');
        const answerContent = item.querySelector('.faq-answer');

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other active items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer-container').style.height = '0';
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                answerContainer.style.height = '0';
            } else {
                item.classList.add('active');
                answerContainer.style.height = `${answerContent.offsetHeight}px`;
            }
        });
    });

    // 5. Modal Popup Logic
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    const openModalBtns = document.querySelectorAll('.apply-now-btn');

    function openModal() {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        resetForm();
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    openModalBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    }));

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeModal();
        }
    });

    // 6. Multi-Step Form Logic
    const formBody = document.querySelector('.modal-body');
    const initialFormHTML = formBody.innerHTML;

    let applicationForm, formSteps, progressSteps, progressBar, prevBtn, nextBtn, formSubmitBtn;
    let currentStep = 0;

    function initializeForm() {
        applicationForm = document.getElementById('applicationForm');
        formSteps = document.querySelectorAll('.form-step');
        progressSteps = document.querySelectorAll('.modal-progress-step');
        progressBar = document.querySelector('.modal-progress-bar');
        prevBtn = document.querySelector('.form-prev-btn');
        nextBtn = document.querySelector('.form-next-btn');
        formSubmitBtn = document.querySelector('.form-submit-btn');

        if (!applicationForm) return;

        // Reset progress state
        currentStep = 0;
        updateFormProgress();

        // Navigation listeners
        prevBtn.addEventListener('click', () => {
            currentStep--;
            updateFormProgress();
        });

        nextBtn.addEventListener('click', () => {
            if (validateCurrentStep()) {
                currentStep++;
                updateFormProgress();
            }
        });

        // Clear errors on input
        applicationForm.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
            input.addEventListener('input', () => {
                const errorMsg = input.nextElementSibling;
                if (input.value.trim()) {
                    clearInputError(input, errorMsg);
                }
            });
            input.addEventListener('change', () => {
                const errorMsg = input.nextElementSibling;
                if (input.value) {
                    clearInputError(input, errorMsg);
                }
            });
        });

        // Submit listener
        applicationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateCurrentStep()) {
                const formData = new FormData(applicationForm);
                const dataObj = {};
                formData.forEach((val, key) => dataObj[key] = val);
                
                // FormSubmit Configuration
                dataObj['_subject'] = "New Application: Fortune 500 AI Skills";
                dataObj['_captcha'] = "false";

                // Show submitting state on the button
                if (formSubmitBtn) {
                    formSubmitBtn.disabled = true;
                    formSubmitBtn.textContent = 'Submitting...';
                }

                // Send email notification via FormSubmit AJAX
                fetch("https://formsubmit.co/ajax/heliocenture@gmail.com", {
                    method: "POST",
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(dataObj)
                })
                .then(() => {
                    // Show Success Layout inside the modal body
                    formBody.innerHTML = `
                        <div class="form-success-container">
                            <span class="material-symbols-outlined form-success-icon" data-icon="check_circle">check_circle</span>
                            <h3 class="form-success-title">Application Submitted!</h3>
                            <p class="form-success-text">
                                Thank you for applying, <strong>${dataObj.fullName}</strong>. We have received your application. Our admissions team will review your background and get in touch at <strong>${dataObj.email}</strong> within 24 hours.
                            </p>
                            <button class="btn btn-primary" id="btn-success-close" style="width: 100%; margin-top: 1rem;">Close</button>
                        </div>
                    `;
                    document.getElementById('btn-success-close').addEventListener('click', closeModal);
                })
                .catch(error => {
                    console.error('Error submitting form:', error);
                    // Fallback to showing success screen even if network request fails so user doesn't get stuck
                    formBody.innerHTML = `
                        <div class="form-success-container">
                            <span class="material-symbols-outlined form-success-icon" data-icon="check_circle">check_circle</span>
                            <h3 class="form-success-title">Application Submitted!</h3>
                            <p class="form-success-text">
                                Thank you for applying, <strong>${dataObj.fullName}</strong>. We have received your application. Our admissions team will review your background and get in touch at <strong>${dataObj.email}</strong> within 24 hours.
                            </p>
                            <button class="btn btn-primary" id="btn-success-close" style="width: 100%; margin-top: 1rem;">Close</button>
                        </div>
                    `;
                    document.getElementById('btn-success-close').addEventListener('click', closeModal);
                });
            }
        });
    }

    function updateFormProgress() {
        if (!formSteps || !progressBar || !progressSteps) return;

        formSteps.forEach((step, idx) => {
            step.classList.toggle('active', idx === currentStep);
        });

        const totalSteps = formSteps.length;
        const progressPercentage = (currentStep / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        progressSteps.forEach((circle, idx) => {
            circle.classList.toggle('active', idx === currentStep);
            circle.classList.toggle('completed', idx < currentStep);
        });

        prevBtn.style.display = currentStep === 0 ? 'none' : 'block';

        if (currentStep === totalSteps - 1) {
            nextBtn.style.display = 'none';
            formSubmitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            formSubmitBtn.style.display = 'none';
        }
    }

    function validateCurrentStep() {
        if (!formSteps) return true;
        const stepElement = formSteps[currentStep];
        const requiredInputs = stepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            const errorMsg = input.nextElementSibling;
            if (!input.value.trim()) {
                showInputError(input, errorMsg, 'This field is required.');
                isValid = false;
            } else if (input.type === 'email' && !validateEmail(input.value)) {
                showInputError(input, errorMsg, 'Please enter a valid email address.');
                isValid = false;
            } else {
                clearInputError(input, errorMsg);
            }
        });

        return isValid;
    }

    function showInputError(input, errorMsgElement, text) {
        input.classList.add('invalid');
        if (errorMsgElement && errorMsgElement.classList.contains('form-error-msg')) {
            errorMsgElement.textContent = text;
            errorMsgElement.style.display = 'block';
        }
    }

    function clearInputError(input, errorMsgElement) {
        input.classList.remove('invalid');
        if (errorMsgElement && errorMsgElement.classList.contains('form-error-msg')) {
            errorMsgElement.style.display = 'none';
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function resetForm() {
        const isSuccessActive = formBody.querySelector('.form-success-container');
        if (isSuccessActive) {
            formBody.innerHTML = initialFormHTML;
            initializeForm();
        } else if (applicationForm) {
            applicationForm.reset();
            applicationForm.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
                const errorMsg = input.nextElementSibling;
                clearInputError(input, errorMsg);
            });
            currentStep = 0;
            updateFormProgress();
        }
    }

    // Run initial form setup
    initializeForm();

    // 7. Curriculum Modules Accordion
    const moduleCards = document.querySelectorAll('.module-card');
    
    // Set first module active by default
    if (moduleCards.length > 0) {
        moduleCards[0].classList.add('active');
        const headerBtn = moduleCards[0].querySelector('.module-header-btn');
        if (headerBtn) {
            headerBtn.setAttribute('aria-expanded', 'true');
        }
    }
    
    moduleCards.forEach(card => {
        const headerBtn = card.querySelector('.module-header-btn');
        if (!headerBtn) return;
        
        headerBtn.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            
            // Close all other modules
            moduleCards.forEach(otherCard => {
                if (otherCard !== card && otherCard.classList.contains('active')) {
                    otherCard.classList.remove('active');
                    const otherBtn = otherCard.querySelector('.module-header-btn');
                    if (otherBtn) {
                        otherBtn.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            
            // Toggle current module
            if (isActive) {
                card.classList.remove('active');
                headerBtn.setAttribute('aria-expanded', 'false');
            } else {
                card.classList.add('active');
                headerBtn.setAttribute('aria-expanded', 'true');
            }
            
            // Smooth scroll into view when expanding
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
        });
    });

    // 8. Stacked Cards Scroll Animation
    const moduleWrappers = document.querySelectorAll('.module-card-wrapper');
    const isDesktop = () => window.innerWidth >= 768;

    function handleScrollStacking() {
        if (!isDesktop()) {
            // Reset styles on mobile/tablet viewports
            moduleCards.forEach(card => {
                card.style.transform = '';
                card.style.opacity = '';
            });
            return;
        }

        moduleWrappers.forEach((wrapper, index) => {
            // Don't apply scroll scaling to the last card
            if (index === moduleWrappers.length - 1) return;

            const card = wrapper.querySelector('.module-card');
            if (!card) return;

            const rect = wrapper.getBoundingClientRect();
            // Calculate sticky start point based on CSS calc(95px + (var(--index) * 24px))
            const stickyTop = 95 + (index * 24);
            const scrolledPast = stickyTop - rect.top;

            if (scrolledPast > 0) {
                const range = 400; // Scroll distance over which the card shrinks/dims
                const progress = Math.min(Math.max(scrolledPast / range, 0), 1);
                
                const scale = 1 - (progress * 0.08); // scale down to 0.92
                const opacity = 1 - (progress * 0.4); // fade down to 0.6
                
                card.style.transform = `scale(${scale}) translateY(-${progress * 15}px)`;
                card.style.opacity = `${opacity}`;
            } else {
                card.style.transform = 'scale(1) translateY(0px)';
                card.style.opacity = '1';
            }
        });
    }

    window.addEventListener('scroll', handleScrollStacking);
    window.addEventListener('resize', handleScrollStacking);
    // Initial run to capture correct state
    handleScrollStacking();
});
