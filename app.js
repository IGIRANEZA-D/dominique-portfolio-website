/* ===== Theme Toggle ===== */
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ===== Mobile Menu Toggle ===== */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

/* ===== Animated Statistics Counter ===== */
function animateCounter(element, target, duration = 1500) {
    let start = 0;
    const increment = target / (duration / 16);

    const counter = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            const target = parseInt(entry.target.dataset.target);
            animateCounter(entry.target, target);
            entry.target.dataset.animated = 'true';
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-number').forEach(el => statsObserver.observe(el));

/* ===== Animated Skill Bars ===== */
const skillBarsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            const width = entry.target.dataset.width;
            entry.target.style.width = width;
            entry.target.dataset.animated = 'true';
            skillBarsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-bar-fill').forEach(el => skillBarsObserver.observe(el));

/* ===== Project Card Expand/Collapse ===== */
document.querySelectorAll('.project-card').forEach(card => {
    const expandBtn = card.querySelector('.expand-btn');

    expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        const isExpanded = card.dataset.expanded === 'true';

        // Close other expanded cards
        document.querySelectorAll('.project-card').forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.dataset.expanded = 'false';
            }
        });

        // Toggle current card
        card.dataset.expanded = isExpanded ? 'false' : 'true';

        // Scroll into view if expanded
        if (!isExpanded) {
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    });
});

/* ===== Chat Functionality ===== */
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

const profileData = {
    name: "IGIRANEZA Dominique",
    role: "Data Scientist & Business Analyst",
    location: "Kigali, Rwanda",
    email: "igdominik250@gmail.com",
    phone: "+250791029550",
    experience: "3+ years",
    education: "Bachelor of Applied Statistics (graduating Oct 2025)",
    current_role: "Business Analyst at Rama Consult (Jan 2026 - Present)",

    skills: {
        languages: ["R Programming", "SQL", "Python", "Stata"],
        bi_tools: ["Power BI", "R Shiny", "Tableau"],
        data_tools: ["Excel (Advanced)", "KoboToolbox", "Machine Learning/AI"],
        soft_skills: ["Analytical thinking", "Data storytelling", "Problem-solving", "Stakeholder communication"]
    },

    projects: [
        {
            title: "NISR Big Data Hackathon (Nov 2025)",
            description: "Rwanda export data analysis with ML models and R Shiny dashboard with GIS visualization"
        },
        {
            title: "Power BI Store Sales Dashboard (Dec 2025)",
            description: "Multi-regional business intelligence dashboard with sales performance analysis"
        },
        {
            title: "AI Impact in Education (Sept 2024)",
            description: "Predictive modeling study on AI's impact on student performance using R and machine learning"
        },
        {
            title: "Rwanda Strategic Research (Rama Consult)",
            description: "National-level research projects with data-driven policy recommendations"
        }
    ],

    certifications: [
        "Data Science with R (Apr 2024)",
        "NISR Big Data Hackathon (Dec 2025)",
        "AI Foundation (Aug 2025)",
        "Advanced Excel Formulas (Apr 2024)",
        "Data Visualization with Excel (Apr 2024)",
        "Managing Data with Microsoft 365 (Sept 2025)"
    ]
};

function generateResponse(message) {
    const msg = message.toLowerCase().trim();

    // Contact
    if (msg.includes('email') || msg.includes('contact') || msg.includes('reach')) {
        return `You can reach me at ${profileData.email} or call +250791029550. I'm also available on LinkedIn!`;
    }

    if (msg.includes('phone')) {
        return `My phone number is: ${profileData.phone}`;
    }

    // Projects
    if (msg.includes('project') || msg.includes('work')) {
        let response = `I've worked on several exciting data science projects:\n\n`;
        profileData.projects.forEach((proj, idx) => {
            response += `${idx + 1}. **${proj.title}**: ${proj.description}\n`;
        });
        return response;
    }

    // Skills
    if (msg.includes('skill') || msg.includes('technology') || msg.includes('tool')) {
        return `My technical expertise includes:\n\n📊 **Languages**: ${profileData.skills.languages.join(', ')}\n\n📈 **BI Tools**: ${profileData.skills.bi_tools.join(', ')}\n\n🛠️ **Data Tools**: ${profileData.skills.data_tools.join(', ')}\n\n💡 **Soft Skills**: ${profileData.skills.soft_skills.join(', ')}`;
    }

    // Certifications
    if (msg.includes('certificate') || msg.includes('certification')) {
        let response = `I've earned ${profileData.certifications.length} certifications:\n\n`;
        profileData.certifications.forEach((cert, idx) => {
            response += `${idx + 1}. 🏆 ${cert}\n`;
        });
        return response;
    }

    // Education
    if (msg.includes('education') || msg.includes('degree') || msg.includes('studied')) {
        return `I'm pursuing a Bachelor of Applied Statistics from the University of Rwanda, with a concentration in Economics. Graduating October 17, 2025. This foundation combines rigorous statistical theory with practical data analysis skills.`;
    }

    // Experience
    if (msg.includes('experience') || msg.includes('background') || msg.includes('work experience')) {
        return `I have ${profileData.experience} of professional experience. Currently, I'm a Business Analyst at Rama Consult (since Jan 2026), focusing on institutional capacity building, strategic research, and data-driven transformation. Previously, I worked as a Facilitator and Data Scientist at EduConnect Rwanda and as a Researcher at IPAR Rwanda.`;
    }

    // Current role
    if (msg.includes('currently') || msg.includes('doing') || msg.includes('role')) {
        return `I'm currently a Business Analyst at Rama Consult, leading institutional capacity building, strategic research projects, and translating complex analytics into policy recommendations for national initiatives.`;
    }

    // Availability
    if (msg.includes('available') || msg.includes('hire') || msg.includes('opportunity')) {
        return `I'm open to select engagements and collaboration opportunities. Feel free to reach out at ${profileData.email} to discuss potential projects or partnerships!`;
    }

    // Location
    if (msg.includes('location') || msg.includes('where') || msg.includes('based')) {
        return `I'm based in Kigali, Rwanda, and I'm open to both in-person collaboration and remote opportunities.`;
    }

    // About/Intro
    if (msg.includes('who') || msg.includes('about') || msg.includes('tell me about')) {
        return `Hi! I'm ${profileData.name}, a ${profileData.role} with ${profileData.experience} of professional experience. I specialize in transforming complex data into strategic insights through statistical analysis, machine learning, and business intelligence. I'm passionate about data storytelling and helping organizations make evidence-based decisions.`;
    }

    // Default response
    return `Thanks for the question! I'm here to help. Feel free to ask me about my experience, projects, technical skills, certifications, education, availability, or anything else. What would you like to know?`;
}

function sendMessage() {
    const message = chatInput.value.trim();

    if (!message) return;

    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-message user';
    userMessageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
        <div class="message-avatar">👤</div>
    `;
    chatMessages.appendChild(userMessageDiv);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate typing delay
    setTimeout(() => {
        const response = generateResponse(message);
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'chat-message bot';
        botMessageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">${escapeHtml(response).replace(/\n/g, '<br>')}</div>
        `;
        chatMessages.appendChild(botMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Re-enable send button
        sendBtn.disabled = false;
    }, 500);

    // Disable send button during response
    sendBtn.disabled = true;
}

sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

/* ===== Utility Functions ===== */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ===== Smooth Scroll Navigation ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

/* ===== Focus Management ===== */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navLinks.classList.remove('active');
    }
});

/* ===== Performance: Lazy Loading ===== */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

/* ===== Initialization ===== */
console.log('🚀 Advanced Data Scientist Portfolio loaded successfully!');
console.log(`Welcome to ${profileData.name}'s portfolio`);
