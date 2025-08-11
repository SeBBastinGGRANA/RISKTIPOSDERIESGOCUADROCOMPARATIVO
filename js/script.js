// script.js
'use strict';

// Configuración global
const CONFIG = {
    ANIMATION_DELAY: 100,
    SEARCH_DEBOUNCE: 300,
    LOADING_MIN_TIME: 1000
};

// Estado de la aplicación
const AppState = {
    currentSection: 'financieros',
    currentFilter: 'all',
    searchTerm: '',
    isLoading: true
};

// Utilidades
const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    announce(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
    },

    updateResultsCount() {
        const visibleRows = document.querySelectorAll('#riskTable tbody tr:not(.hidden)').length;
        const totalRows = document.querySelectorAll('#riskTable tbody tr').length;
        const resultsElement = document.getElementById('resultsCount');
        
        if (resultsElement) {
            resultsElement.textContent = `Mostrando ${visibleRows} de ${totalRows} riesgos`;
        }
    }
};

// Gestión de la navegación
class NavigationManager {
    constructor() {
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.sections = document.querySelectorAll('.risk-section');
        this.init();
    }

    init() {
        this.navButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleNavigation(e));
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleNavigation(e);
                }
            });
        });
    }

    handleNavigation(event) {
        const targetSection = event.currentTarget.getAttribute('data-section');
        
        if (targetSection === AppState.currentSection) return;

        this.updateActiveStates(event.currentTarget, targetSection);
        this.switchSection(targetSection);
        
        AppState.currentSection = targetSection;
        Utils.announce(`Navegando a sección: ${this.getSectionTitle(targetSection)}`);
    }

    updateActiveStates(activeButton, targetSection) {
        // Actualizar botones
        this.navButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');

        // Actualizar secciones
        this.sections.forEach(section => section.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
    }

    switchSection(targetSection) {
        const section = document.getElementById(targetSection);
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Animar tarjetas si es una sección de riesgos
        if (targetSection !== 'comparativo') {
            this.animateCards(section);
        }
    }

    animateCards(section) {
        const cards = section.querySelectorAll('.risk-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * CONFIG.ANIMATION_DELAY);
        });
    }

    getSectionTitle(sectionId) {
        const titles = {
            'financieros': 'Riesgos Financieros',
            'no-financieros': 'Riesgos No Financieros',
            'comparativo': 'Cuadro Comparativo'
        };
        return titles[sectionId] || sectionId;
    }
}

// Gestión de tarjetas de riesgo
class RiskCardManager {
    constructor() {
        this.riskCards = document.querySelectorAll('.risk-card');
        this.init();
    }

    init() {
        this.riskCards.forEach(card => {
            card.addEventListener('click', () => this.toggleCard(card));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleCard(card);
                }
            });

            // Efectos de hover mejorados
            card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
            card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
        });
    }

    toggleCard(card) {
        const isExpanded = card.classList.contains('expanded');
        const riskType = card.querySelector('h3').textContent;
        
        card.classList.toggle('expanded');
        card.setAttribute('aria-expanded', !isExpanded);
        
        const action = isExpanded ? 'contraída' : 'expandida';
        Utils.announce(`Tarjeta ${riskType} ${action}`);
    }

    handleCardHover(card, isHovering) {
        if (isHovering) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        } else if (!card.classList.contains('expanded')) {
            card.style.transform = 'translateY(0) scale(1)';
        }
    }

    expandAllCards() {
        this.riskCards.forEach(card => {
            card.classList.add('expanded');
            card.setAttribute('aria-expanded', 'true');
        });
    }

    collapseAllCards() {
        this.riskCards.forEach(card => {
            card.classList.remove('expanded');
            card.setAttribute('aria-expanded', 'false');
        });
    }
}

// Gestión de la tabla comparativa
class TableManager {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.tableRows = document.querySelectorAll('#riskTable tbody tr');
        this.searchInput = document.getElementById('searchInput');
        this.init();
    }

    init() {
        // Filtros
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Búsqueda con debounce
        if (this.searchInput) {
            const debouncedSearch = Utils.debounce((term) => this.handleSearch(term), CONFIG.SEARCH_DEBOUNCE);
            this.searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Inicializar contador
        Utils.updateResultsCount();
    }

    handleFilter(event) {
        const filter = event.currentTarget.getAttribute('data-filter');
        
        if (filter === AppState.currentFilter) return;

        // Actualizar botones activos
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');

        AppState.currentFilter = filter;
        this.applyFilters();
        
        Utils.announce(`Filtro aplicado: ${this.getFilterName(filter)}`);
    }

    handleSearch(searchTerm) {
        AppState.searchTerm = searchTerm.toLowerCase();
        this.applyFilters();
        
        if (searchTerm) {
            Utils.announce(`Búsqueda realizada: ${searchTerm}`);
        }
    }

    applyFilters() {
        let visibleCount = 0;

        this.tableRows.forEach(row => {
            const category = row.getAttribute('data-category');
            const rowText = row.textContent.toLowerCase();
            
            const matchesFilter = AppState.currentFilter === 'all' || category === AppState.currentFilter;
            const matchesSearch = !AppState.searchTerm || rowText.includes(AppState.searchTerm);

            if (matchesFilter && matchesSearch) {
                row.style.display = '';
                row.classList.remove('hidden');
                visibleCount++;
            } else {
                row.style.display = 'none';
                row.classList.add('hidden');
            }
        });

        Utils.updateResultsCount();
    }

    getFilterName(filter) {
        const names = {
            'all': 'Todos los riesgos',
            'financiero': 'Riesgos financieros',
            'no-financiero': 'Riesgos no financieros'
        };
        return names[filter] || filter;
    }
}

// Gestión del estado de carga
class LoadingManager {
    constructor() {
        this.loadingOverlay = document.getElementById('loading');
        this.startTime = Date.now();
    }

    hide() {
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, CONFIG.LOADING_MIN_TIME - elapsedTime);

        setTimeout(() => {
            if (this.loadingOverlay) {
                this.loadingOverlay.classList.add('hidden');
                AppState.isLoading = false;
                
                // Remover del DOM después de la transición
                setTimeout(() => {
                    if (this.loadingOverlay.parentNode) {
                        this.loadingOverlay.parentNode.removeChild(this.loadingOverlay);
                    }
                }, 500);
            }
        }, remainingTime);
    }
}

// Funcionalidades adicionales
class FeatureManager {
    constructor() {
        this.init();
    }

    init() {
        this.addKeyboardShortcuts();
        this.addPrintSupport();
        this.addAnalytics();
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + 1, 2, 3 para navegar entre secciones
            if (e.altKey && ['1', '2', '3'].includes(e.key)) {
                e.preventDefault();
                const sections = ['financieros', 'no-financieros', 'comparativo'];
                const sectionIndex = parseInt(e.key) - 1;
                
                if (sections[sectionIndex]) {
                    const button = document.querySelector(`[data-section="${sections[sectionIndex]}"]`);
                    if (button) button.click();
                }
            }

            // Escape para cerrar todas las tarjetas expandidas
            if (e.key === 'Escape') {
                document.querySelectorAll('.risk-card.expanded').forEach(card => {
                    card.classList.remove('expanded');
                    card.setAttribute('aria-expanded', 'false');
                });
            }
        });
    }

    addPrintSupport() {
        // Expandir todas las tarjetas antes de imprimir
        window.addEventListener('beforeprint', () => {
            document.querySelectorAll('.risk-card .details').forEach(details => {
                details.style.opacity = '1';
                details.style.maxHeight = 'none';
            });
        });
    }

    addAnalytics() {
        // Simular eventos de analytics (reemplazar con GA4 o similar)
        const trackEvent = (action, category, label) => {
            console.log(`Analytics: ${category} - ${action} - ${label}`);
            // gtag('event', action, { event_category: category, event_label: label });
        };

        // Tracking de navegación
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-btn')) {
                const section = e.target.getAttribute('data-section');
                trackEvent('navigate', 'navigation', section);
            }

            if (e.target.closest('.risk-card')) {
                const riskType = e.target.closest('.risk-card').getAttribute('data-risk');
                trackEvent('expand_card', 'interaction', riskType);
            }
        });
    }
}

// Inicialización de la aplicación
class App {
    constructor() {
        this.loadingManager = new LoadingManager();
        this.navigationManager = null;
        this.riskCardManager = null;
        this.tableManager = null;
        this.featureManager = null;
    }

    async init() {
        try {
            // Esperar a que el DOM esté completamente cargado
            await this.waitForDOM();

            // Inicializar componentes
            this.navigationManager = new NavigationManager();
            this.riskCardManager = new RiskCardManager();
            this.tableManager = new TableManager();
            this.featureManager = new FeatureManager();

            // Ocultar loading
            this.loadingManager.hide();

            // Animación inicial
            this.initialAnimation();

            console.log('🚀 Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.loadingManager.hide();
        }
    }

    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    initialAnimation() {
        // Animar las tarjetas de la sección activa
        const activeSection = document.querySelector('.risk-section.active');
        if (activeSection && this.navigationManager) {
            this.navigationManager.animateCards(activeSection);
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// Manejo de errores globales
window.addEventListener('error', (e) => {
    console.error('Error global capturado:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rechazada no manejada:', e.reason);
});
