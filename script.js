document.addEventListener('DOMContentLoaded', () => {
    // Determine language: URL param > localStorage > default 'en'
    const urlParams = new URLSearchParams(window.location.search);
    let lang = urlParams.get('lang') || localStorage.getItem('lang') || 'en';

    // Validate language
    if (!translations[lang]) {
        lang = 'en';
    }

    // Save choice for persistence across pages
    localStorage.setItem('lang', lang);

    setLanguage(lang);

    // Theme Handling Initialization
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const toggleBtn = document.getElementById('theme-toggle');

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // default dark unless system says light strongly
        document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Intercept language menu clicks for instant switch
    document.querySelectorAll('.lang-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = link.getAttribute('data-lang');
            setLanguage(newLang);

            // Close menu if open (for mobile)
            if (navLinks) navLinks.classList.remove('open');

            // Update URL without reloading to keep state clean
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('lang', newLang);
            window.history.pushState({}, '', newUrl);
        });
    });

    // Intercept clicks on same-origin links to preserve language/theme
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        // Filter out anchors, mailto, language selectors, and full external URLs
        if (href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('#') && !link.hasAttribute('data-lang')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const currentLang = localStorage.getItem('lang') || 'en';
                const baseHref = href.split('?')[0];
                window.location.href = `${baseHref}?lang=${currentLang}`;
            });
        }
    });
});

function setLanguage(lang) {
    // Save to localStorage whenever language is set
    localStorage.setItem('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(translations[lang], key);
        if (translation) {
            if (translation.includes('<')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        const translation = getNestedTranslation(translations[lang], key);
        if (translation) {
            element.alt = translation;
        }
    });

    const currentLangBtn = document.querySelector('.current-lang');
    if (currentLangBtn) {
        currentLangBtn.textContent = lang.toUpperCase();
    }

    document.documentElement.lang = lang;
}

function getNestedTranslation(obj, path) {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj);
}
