document.addEventListener('DOMContentLoaded', () => {

    const ticketsContainer = document.getElementById('tickets-container');
    const ticketTemplate = document.getElementById('ticket-card-template');
    const messageContainer = document.getElementById('message-container');
    const loadingSpinner = document.getElementById('loading-spinner');

    function showMessage(message, type = 'danger') {
        messageContainer.textContent = message;
        messageContainer.className = `alert alert-${type}`;
        messageContainer.style.display = 'block';
    }

    function generateQRCode(element, text) {
        try {
            const qr = qrcode(4, 'M');
            qr.addData(text, 'Byte');
            qr.make();

            const cellSize = 2;
            const margin = 0;
            element.innerHTML = qr.createTableTag(cellSize, margin);

            const table = element.querySelector('table');
            if (table) {
                table.style.width = '100%';
                table.style.height = '100%';
                table.style.border = 'none';
            }
        } catch (error) {
            console.error("Failed to generate QR code:", error);
            element.innerHTML = "QR Error";
        }
    }


    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    async function loadMyTickets() {
        loadingSpinner.style.display = 'block';
        try {
            const response = await fetch('/role_users/my-tickets', {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    showMessage('You are not logged in. Redirecting to login page...', 'warning');
                    setTimeout(() => window.location.href = '/login.html', 2000);
                } else {
                    throw new Error('Failed to load tickets.');
                }
                return;
            }

            const tickets = await response.json();

            if (!tickets || tickets.length === 0) {
                showMessage('You have not purchased any tickets yet.', 'info');
                return;
            }

            ticketsContainer.innerHTML = '';

            tickets.forEach(ticket => {
                const card = ticketTemplate.content.cloneNode(true);

                card.querySelector('[data-field="airline_name"]').textContent = ticket.airline_name || 'N/A';
                card.querySelector('[data-field="passenger_name"]').textContent = `${ticket.first_name || ''} ${ticket.last_name || ''}`;
                const seatNameEl = card.querySelector('[data-field="seat_name"]');
                if (ticket.chair_name) {
                    seatNameEl.textContent = `Seat: ${ticket.chair_name}`;
                } else {
                    seatNameEl.style.display = 'none'; 
                }
                card.querySelector('[data-field="origin_country"]').textContent = ticket.origin_country || 'N/A';
                card.querySelector('[data-field="destination_country"]').textContent = ticket.destination_country || 'N/A';
                card.querySelector('[data-field="departure_time"]').textContent = `Departs: ${formatDateTime(ticket.departure_time)}`;
                card.querySelector('[data-field="landing_time"]').textContent = `Arrives: ${formatDateTime(ticket.landing_time)}`;
                card.querySelector('[data-field="ticket_code"]').textContent = ticket.ticket_code || 'N/A';

                const qrPlaceholder = card.querySelector('.qrcode-placeholder');
                if (ticket.ticket_code) {
                    generateQRCode(qrPlaceholder, ticket.ticket_code);
                } else {
                    qrPlaceholder.innerHTML = 'No Ticket Code';
                }

                ticketsContainer.appendChild(card.firstElementChild);
            });

        } catch (error) {
            showMessage(error.message, 'danger');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    loadMyTickets();
});