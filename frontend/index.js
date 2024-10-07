import { backend } from 'declarations/backend';

const LOGS_PER_PAGE = 10;
let currentPage = 1;
let totalLogs = 0;

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const logsContainer = document.getElementById('logs-container');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

async function fetchLogs(start, limit) {
    try {
        const logs = await backend.getLogs(start, limit);
        displayLogs(logs);
        updatePagination();
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}

function displayLogs(logs) {
    logsContainer.innerHTML = '';
    logs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.className = 'log-entry';
        logElement.innerHTML = `
            <p><strong>Canister:</strong> ${log.canisterId}</p>
            <p><strong>Timestamp:</strong> ${new Date(Number(log.timestamp) / 1000000).toLocaleString()}</p>
            <p><strong>Message:</strong> ${log.message}</p>
        `;
        logsContainer.appendChild(logElement);
    });
}

async function searchLogs() {
    const query = searchInput.value.trim();
    if (query) {
        try {
            const searchResults = await backend.searchLogs(query);
            displayLogs(searchResults);
            updatePagination(searchResults.length);
        } catch (error) {
            console.error('Error searching logs:', error);
        }
    } else {
        fetchLogs((currentPage - 1) * LOGS_PER_PAGE, LOGS_PER_PAGE);
    }
}

function updatePagination(searchResultsCount) {
    if (searchResultsCount !== undefined) {
        totalLogs = searchResultsCount;
        currentPage = 1;
    }

    const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}

prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchLogs((currentPage - 1) * LOGS_PER_PAGE, LOGS_PER_PAGE);
    }
});

nextPageButton.addEventListener('click', () => {
    const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        fetchLogs((currentPage - 1) * LOGS_PER_PAGE, LOGS_PER_PAGE);
    }
});

searchButton.addEventListener('click', searchLogs);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchLogs();
    }
});

// Initial load
fetchLogs(0, LOGS_PER_PAGE);
