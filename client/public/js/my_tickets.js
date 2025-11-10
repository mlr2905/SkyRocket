// קובץ: js/my-tickets.js

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
            element.innerHTML = qr.createTableTag(2, 0); 
            const table = element.querySelector('table');
            if(table) {
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

    async function handleCancelTicket(event) {
        const cardElement = event.target.closest('.ticket-card');
        const ticketId = cardElement.dataset.ticketId;
        
        if (!confirm(`Are you sure you want to cancel ticket ${ticketId}?`)) {
            return;
        }

        loadingSpinner.style.display = 'block';
        
        try {
            const response = await fetch(`/role_users/my-tickets/${ticketId}`, {
                method: 'DELETE',
                credentials: 'include' 
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to cancel ticket.");
            }
            
            cardElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                 cardElement.remove();
                 showMessage('Ticket cancelled successfully.', 'success');
                 if (ticketsContainer.childElementCount === 0) {
                     showMessage('You have no remaining tickets.', 'info');
                 }
            }, 500);

        } catch (error) {
            showMessage(error.message, 'danger');
        } finally {
            loadingSpinner.style.display = 'none';
        }
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
                const cardElement = card.firstElementChild;
                
                cardElement.dataset.ticketId = ticket.ticket_id;
                
                card.querySelector('[data-field="airline_name"]').textContent = ticket.airline_name || 'N/A';
                card.querySelector('[data-field="passenger_name"]').textContent = `${ticket.first_name || ''} ${ticket.last_name || ''}`;
                card.querySelector('[data-field="origin_country"]').textContent = ticket.origin_country || 'N/A';
                card.querySelector('[data-field="destination_country"]').textContent = ticket.destination_country || 'N/A';
                card.querySelector('[data-field="departure_time"]').textContent = `Departs: ${formatDateTime(ticket.departure_time)}`;
                card.querySelector('[data-field="landing_time"]').textContent = `Arrives: ${formatDateTime(ticket.landing_time)}`;
                card.querySelector('[data-field="ticket_code"]').textContent = ticket.ticket_code || 'N/A';

                // --- תיקון: הצגת שם הכיסא ---
                const seatNameEl = card.querySelector('[data-field="seat_name"]');
                if (ticket.chair_name) {
                    seatNameEl.textContent = `Seat: ${ticket.chair_name}`;
                } else {
                    seatNameEl.style.display = 'none';
                }
                
                const qrPlaceholder = card.querySelector('.qrcode-placeholder');
                if (ticket.ticket_code) {
                    generateQRCode(qrPlaceholder, ticket.ticket_code);
                } else {
                    qrPlaceholder.innerHTML = 'No Ticket Code';
                }

                const cancelButton = card.querySelector('.cancel-ticket-btn');
                cancelButton.addEventListener('click', handleCancelTicket);

                ticketsContainer.appendChild(cardElement);
            });

        } catch (error) {
            showMessage(error.message, 'danger');
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    loadMyTickets();
});