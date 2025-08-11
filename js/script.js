// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Navegación entre secciones
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.risk-section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');

            // Remover clase active de todos los botones y secciones
            navButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Agregar clase active al botón clickeado y sección correspondiente
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Expandir/contraer tarjetas de riesgo
    const riskCards = document.querySelectorAll('.risk-card');

    riskCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });

    // Filtrado de tabla comparativa
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tableRows = document.querySelectorAll('#riskTable tbody tr');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');

            // Actualizar botones activos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filtrar filas
            tableRows.forEach(row => {
                const category = row.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    row.classList.remove('hidden');
                    row.style.display = '';
                } else {
                    row.classList.add('hidden');
                    row.style.display = 'none';
                }
            });
        });
    });

    // Animación de entrada para las tarjetas
    function animateCards() {
        const cards = document.querySelectorAll('.risk-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Llamar animación inicial
    animateCards();

    // Búsqueda en tabla (funcionalidad adicional)
    function addSearchFunctionality() {
        const searchContainer = document.querySelector('.comparison-filter');
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Buscar tipo de riesgo...';
        searchInput.style.cssText = `
            padding: 10px 15px;
            border: 2px solid #667eea;
            border-radius: 20px;
            margin-left: 1rem;
            width: 200px;
            outline: none;
        `;

        searchContainer.appendChild(searchInput);

        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

            tableRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                const category = row.getAttribute('data-category');
                const matchesSearch = rowText.includes(searchTerm);
                const matchesFilter = activeFilter === 'all' || category === activeFilter;

                if (matchesSearch && matchesFilter) {
                    row.style.display = '';
                    row.classList.remove('hidden');
                } else {
                    row.style.display = 'none';
                    row.classList.add('hidden');
                }
            });
        });
    }

    // Agregar funcionalidad de búsqueda
    addSearchFunctionality();

    // Efecto de scroll suave para navegación
    function smoothScrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Contador de riesgos por categoría
    function updateRiskCounters() {
        const financialCount = document.querySelectorAll('[data-category="financiero"]').length;
        const nonFinancialCount = document.querySelectorAll('[data-category="no-financiero"]').length;

        console.log(`Riesgos Financieros: ${financialCount}`);
        console.log(`Riesgos No Financieros: ${nonFinancialCount}`);
    }

    updateRiskCounters();

    // Tooltip para las tarjetas
    riskCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('expanded')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
});
