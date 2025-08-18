document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const table = document.getElementById('riskTable');
    const rows = table.getElementsByClassName('risk-row');

    // Funcionalidad de búsqueda en tiempo real
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        Array.from(rows).forEach(row => {
            const cells = row.getElementsByTagName('td');
            let found = false;
            
            // Limpiar highlights anteriores
            Array.from(cells).forEach(cell => {
                cell.innerHTML = cell.textContent;
            });
            
            // Buscar en todas las celdas
            Array.from(cells).forEach(cell => {
                const cellText = cell.textContent.toLowerCase();
                if (cellText.includes(searchTerm) && searchTerm !== '') {
                    found = true;
                    // Highlight del texto encontrado
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    cell.innerHTML = cell.textContent.replace(regex, '<span class="highlight">$1</span>');
                }
            });
            
            // Mostrar/ocultar fila
            row.style.display = (found || searchTerm === '') ? '' : 'none';
        });
        
        updateStats();
    });
});

// Función para limpiar búsqueda
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const rows = document.getElementsByClassName('risk-row');
    
    searchInput.value = '';
    
    Array.from(rows).forEach(row => {
        row.style.display = '';
        const cells = row.getElementsByTagName('td');
        Array.from(cells).forEach(cell => {
            cell.innerHTML = cell.textContent;
        });
    });
    
    updateStats();
}

// Función para filtrar por tipo
function filterTable(filter) {
    const rows = document.getElementsByClassName('risk-row');
    const filterBtns = document.getElementsByClassName('filter-btn');
    
    // Actualizar botones activos
    Array.from(filterBtns).forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filtrar filas
    Array.from(rows).forEach(row => {
        const tipo = row.getAttribute('data-type');
        
        if (filter === 'all') {
            row.style.display = '';
        } else if (filter === 'financieros' && tipo === 'financieros') {
            row.style.display = '';
        } else if (filter === 'no-financieros' && tipo === 'no-financieros') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    updateStats();
}

// Función para actualizar estadísticas
function updateStats() {
    const rows = document.getElementsByClassName('risk-row');
    let total = 0;
    let financial = 0;
    let nonFinancial = 0;
    
    Array.from(rows).forEach(row => {
        if (row.style.display !== 'none') {
            total++;
            const tipo = row.getAttribute('data-type');
            if (tipo === 'financieros') {
                financial++;
            } else {
                nonFinancial++;
            }
        }
    });
    
    document.getElementById('totalRisks').textContent = total;
    document.getElementById('financialRisks').textContent = financial;
    document.getElementById('nonFinancialRisks').textContent = nonFinancial;
}

// Funcionalidad adicional: Exportar a CSV
function exportToCSV() {
    const table = document.getElementById('riskTable');
    const rows = table.querySelectorAll('tr');
    let csvContent = '';
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = Array.from(cells).map(cell => {
            return '"' + cell.textContent.replace(/"/g, '""') + '"';
        }).join(',');
        csvContent += rowData + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cuadro_comparativo_riesgos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Funcionalidad de ordenamiento de columnas
function sortTable(columnIndex) {
    const table = document.getElementById('riskTable');
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    
    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.toLowerCase();
        const cellB = b.cells[columnIndex].textContent.toLowerCase();
        
        if (cellA < cellB) return -1;
        if (cellA > cellB) return 1;
        return 0;
    });
    
    // Remover filas existentes y agregar ordenadas
    rows.forEach(row => tbody.removeChild(row));
    rows.forEach(row => tbody.appendChild(row));
}

// Agregar funcionalidad de click en headers para ordenar
document.addEventListener('DOMContentLoaded', function() {
    const headers = document.querySelectorAll('#riskTable th');
    headers.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => sortTable(index));
    });
});
