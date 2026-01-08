// BC PNP Score Calculator JavaScript

// Score calculation
function calculateScore() {
    // Human Capital Factors
    let humanCapital = 0;

    // Work Experience (max 40 base + 20 bonus = 60, but section cap is 120)
    const workExp = parseInt(document.getElementById('workExperience').value) || 0;
    const canadaExp = document.getElementById('canadaExperience').checked ? 10 : 0;
    const bcWorking = document.getElementById('bcWorking').checked ? 10 : 0;
    const workTotal = workExp + canadaExp + bcWorking;

    // Education (max 40 base + 13 bonus)
    const education = parseInt(document.getElementById('education').value) || 0;
    const educationLocation = parseInt(document.querySelector('input[name="educationLocation"]:checked')?.value) || 0;
    const professionalDesignation = document.getElementById('professionalDesignation').checked ? 5 : 0;
    const educationTotal = education + educationLocation + professionalDesignation;

    // Language (max 40 base + 10 bonus)
    const language = parseInt(document.getElementById('language').value) || 0;
    const bilingual = document.getElementById('bilingual').checked ? 10 : 0;
    const languageTotal = language + bilingual;

    // Sum Human Capital (cap at 120)
    humanCapital = Math.min(workTotal + educationTotal + languageTotal, 120);

    // Economic Factors
    let economic = 0;

    // Wage (max 55)
    const hourlyWage = parseFloat(document.getElementById('hourlyWage').value) || 0;
    let wagePoints = 0;
    if (hourlyWage >= 70) {
        wagePoints = 55;
    } else if (hourlyWage >= 16) {
        wagePoints = Math.floor(hourlyWage) - 15;
    } else {
        wagePoints = 0;
    }
    wagePoints = Math.max(0, Math.min(wagePoints, 55));

    // Employment Area (max 25 base + 10 bonus)
    const employmentArea = parseInt(document.getElementById('employmentArea').value) || 0;
    const regionalBonus = parseInt(document.querySelector('input[name="regionalBonus"]:checked')?.value) || 0;
    const areaTotal = employmentArea + regionalBonus;

    // Sum Economic (cap at 80)
    economic = Math.min(wagePoints + areaTotal, 80);

    // Total Score
    const total = humanCapital + economic;

    // Update UI - Main score display
    document.getElementById('totalScore').textContent = total;
    document.getElementById('humanCapitalScore').textContent = humanCapital;
    document.getElementById('economicScore').textContent = economic;
    document.getElementById('humanCapitalLabel').textContent = humanCapital;
    document.getElementById('economicLabel').textContent = economic;
    document.getElementById('wagePointsDisplay').textContent = wagePoints;

    // Update UI - Sticky score bar
    document.getElementById('stickyTotalScore').textContent = total;
    document.getElementById('stickyHumanCapital').textContent = humanCapital;
    document.getElementById('stickyEconomic').textContent = economic;

    // Update option item styling
    updateOptionStyles();
}

function updateOptionStyles() {
    const checkboxes = document.querySelectorAll('.option-item input[type="checkbox"]');
    checkboxes.forEach(cb => {
        if (cb.checked) {
            cb.closest('.option-item').classList.add('selected');
        } else {
            cb.closest('.option-item').classList.remove('selected');
        }
    });

    const radios = document.querySelectorAll('.option-item input[type="radio"]');
    radios.forEach(radio => {
        if (radio.checked && radio.value !== '0') {
            radio.closest('.option-item').classList.add('selected');
        } else {
            radio.closest('.option-item').classList.remove('selected');
        }
    });
}

// Wage tab switching
function switchWageTab(tab) {
    const hourlyTab = document.getElementById('hourlyTab');
    const annualTab = document.getElementById('annualTab');
    const hourlyInput = document.getElementById('hourlyInput');
    const annualInput = document.getElementById('annualInput');

    if (tab === 'hourly') {
        hourlyTab.classList.add('active');
        annualTab.classList.remove('active');
        hourlyInput.style.display = 'flex';
        annualInput.classList.remove('active');
    } else {
        annualTab.classList.add('active');
        hourlyTab.classList.remove('active');
        hourlyInput.style.display = 'none';
        annualInput.classList.add('active');
    }
}

// Calculate hourly wage from annual salary
function calculateHourlyFromAnnual() {
    const annual = parseFloat(document.getElementById('annualSalary').value) || 0;
    let hours = parseFloat(document.getElementById('hoursPerWeek').value) || 40;
    hours = Math.min(hours, 40); // Max 40 hours per week

    if (annual > 0 && hours > 0) {
        const hourly = (annual / 52) / hours;
        document.getElementById('calculatedHourly').textContent = '$' + hourly.toFixed(2);
        document.getElementById('hourlyResult').style.display = 'block';
        document.getElementById('hourlyWage').value = hourly.toFixed(2);
        calculateScore();
    } else {
        document.getElementById('hourlyResult').style.display = 'none';
    }
}

// Section toggle
function toggleSection(section) {
    const body = document.getElementById(section + 'Body');
    if (body.style.display === 'none') {
        body.style.display = 'block';
    } else {
        body.style.display = 'block'; // Keep sections open for now
    }
}

// Theme toggle
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = 'Light Mode';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = 'Dark Mode';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = 'Light Mode';
        }
    });
}

// Sticky score bar visibility
function initStickyScoreBar() {
    const stickyScoreBar = document.getElementById('stickyScoreBar');
    const scoreDisplay = document.querySelector('.score-display');

    window.addEventListener('scroll', () => {
        if (scoreDisplay) {
            const scoreDisplayRect = scoreDisplay.getBoundingClientRect();
            // Show sticky bar when main score display is scrolled out of view
            if (scoreDisplayRect.bottom < 0) {
                stickyScoreBar.classList.add('visible');
            } else {
                stickyScoreBar.classList.remove('visible');
            }
        }
    });
}

// Scroll to top button
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initScrollToTop();
    initStickyScoreBar();
    calculateScore();
});
