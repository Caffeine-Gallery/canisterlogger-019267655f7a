import { backend } from 'declarations/backend';

const LOGS_PER_PAGE = 10;
let currentPage = 1;
let totalLogs = 0;

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const canisterIdInput = document.getElementById('canister-id-input');
const canisterSearchButton = document.getElementById('canister-search-button');
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
        displayError('Failed to fetch logs. Please try again.');
    }
}

function displayLogs(logs) {
    logsContainer.innerHTML = '';
    if (logs.length === 0) {
        logsContainer.innerHTML = '<p>No logs found.</p>';
        return;
    }
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
            showLoading();
            const searchResults = await backend.searchLogs(query);
            displayLogs(searchResults);
            updatePagination(searchResults.length);
        } catch (error) {
            console.error('Error searching logs:', error);
            displayError('Failed to search logs. Please try again.');
        } finally {
            hideLoading();
        }
    } else {
        fetchLogs((currentPage - 1) * LOGS_PER_PAGE, LOGS_PER_PAGE);
    }
}

async function getLogsByCanisterId() {
    const canisterId = canisterIdInput.value.trim();
    if (canisterId) {
        try {
            showLoading();
            console.log('Fetching logs for canister:', canisterId);
            const logs = await backend.getLogsByCanisterId(canisterId);
            console.log('Logs received:', logs);
            displayLogs(logs);
            updatePagination(logs.length);
        } catch (error) {
            console.error('Error fetching logs for canister:', error);
            displayError('Failed to fetch logs for the specified canister. Please try again.');
        } finally {
            hideLoading();
        }
    } else {
        displayError('Please enter a valid Canister ID');
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

function showLoading() {
    logsContainer.innerHTML = '<p>Loading...</p>';
}

function hideLoading() {
    // This function is called after displayLogs, so we don't need to clear the container here
}

function displayError(message) {
    logsContainer.innerHTML = `<p class="error">${message}</p>`;
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

canisterSearchButton.addEventListener('click', getLogsByCanisterId);
canisterIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getLogsByCanisterId();
    }
});

// Initial load
fetchLogs(0, LOGS_PER_PAGE);

console.log('JavaScript loaded and event listeners attached');
