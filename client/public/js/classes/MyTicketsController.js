import * as C from '../utils/constants.js';
import { PLANE_LAYOUTS } from '../utils/planeLayouts.js';

export class MyTicketsController {
    constructor() {
        this.ticketsContainer = null;
        this.ticketTemplate = null;
        this.messageContainer = null;
        this.loadingSpinner = null;
        this.boundHandleClick = null;
    }

    init() {
        this.ticketsContainer = document.getElementById('tickets-container');
        this.ticketTemplate = document.getElementById('ticket-card-template');
        this.messageContainer = document.getElementById('message-container');
        this.loadingSpinner = document.getElementById('loading-spinner');

        this.boundHandleClick = this.handleTicketClick.bind(this);

        if (this.ticketsContainer) {
            this.ticketsContainer.addEventListener('click', this.boundHandleClick);
        }

        this.loadMyTickets();
    }

    destroy() {
        if (this.ticketsContainer) {
            this.ticketsContainer.removeEventListener('click', this.boundHandleClick);
        }
        this.ticketsContainer = null;
        this.ticketTemplate = null;
        this.messageContainer = null;
        this.loadingSpinner = null;
        this.boundHandleClick = null;
    }

    handleTicketClick(event) {
        const cancelButton = event.target.closest('.cancel-ticket-btn');
        if (cancelButton) {
            this.handleCancelTicket(event);
        }
    }

    showMessage(message, type = 'danger') {
        if (this.messageContainer) {
            this.messageContainer.textContent = message;
            this.messageContainer.className = `alert alert-${type}`;
            this.messageContainer.style.display = 'block';
        }
    }

    generateQRCode(element, text) {
        try {
            const qr = qrcode(4, 'M');
            qr.addData(text, 'Byte');
            qr.make();
            element.innerHTML = qr.createTableTag(2, 0);
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

    formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    async handleCancelTicket(event) {
        const cardElement = event.target.closest('.ticket-card');
        const ticketId = cardElement.dataset.ticketId;

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to cancel ticket ${ticketId}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        });

        if (!result.isConfirmed) return;

        if (this.loadingSpinner) this.loadingSpinner.style.display = 'block';

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
                this.showMessage('Ticket cancelled successfully.', 'success');
                if (this.ticketsContainer && this.ticketsContainer.childElementCount === 0) {
                    this.showMessage('You have no remaining tickets.', 'info');
                }
            }, 500);

        } catch (error) {
            this.showMessage(error.message, 'danger');
        } finally {
            if (this.loadingSpinner) this.loadingSpinner.style.display = 'none';
        }
    }

    getSeatName(plane_id, chair_id) {
        if (!plane_id || !chair_id || !PLANE_LAYOUTS[plane_id]) {
            return 'N/A';
        }
        const layout = PLANE_LAYOUTS[plane_id];
        const seat = layout.find(s => s.id === chair_id);
        return seat ? seat.name : 'N/A';
    }

    async loadMyTickets() {
        if (this.loadingSpinner) this.loadingSpinner.style.display = 'block';
        try {
            const response = await fetch(C.API_MY_TICKETS_URL, {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.showMessage('You are not logged in. Redirecting to login page...', 'warning');
                    setTimeout(() => {
                        history.pushState(null, null, C.API_LOGOUT_URL);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }, 2000);
                } else {
                    throw new Error('Failed to load tickets.');
                }
                return;
            }

            const tickets = await response.json();

            if (!tickets || tickets.length === 0) {
                this.showMessage('You have not purchased any tickets yet.', 'info');
                if (this.ticketsContainer) this.ticketsContainer.innerHTML = '';
                return;
            }

            if (this.ticketsContainer) this.ticketsContainer.innerHTML = '';

            tickets.forEach(ticket => {
                if (!this.ticketTemplate) return;
                const card = this.ticketTemplate.content.cloneNode(true);
                const cardElement = card.firstElementChild;

                cardElement.dataset.ticketId = ticket.ticket_id;

                card.querySelector('[data-field="airline_name"]').textContent = ticket.airline_name || 'N/A';
                card.querySelector('[data-field="passenger_name"]').textContent = `${ticket.first_name || ''} ${ticket.last_name || ''}`;
                card.querySelector('[data-field="origin_country"]').textContent = ticket.origin_country || 'N/A';
                card.querySelector('[data-field="destination_country"]').textContent = ticket.destination_country || 'N/A';
                card.querySelector('[data-field="departure_time"]').textContent = `Departs: ${this.formatDateTime(ticket.departure_time)}`;
                card.querySelector('[data-field="landing_time"]').textContent = `Arrives: ${this.formatDateTime(ticket.landing_time)}`;
                card.querySelector('[data-field="ticket_code"]').textContent = ticket.ticket_code || 'N/A';

                const seatNameEl = card.querySelector('[data-field="seat_name"]');
                const chairName = this.getSeatName(ticket.plane_id, ticket.chair_id);
                if (chairName !== 'N/A') {
                    seatNameEl.textContent = `Seat: ${chairName}`;
                } else {
                    seatNameEl.style.display = 'none';
                }

                const qrPlaceholder = card.querySelector('.qrcode-placeholder');
                if (ticket.ticket_code) {
                    this.generateQRCode(qrPlaceholder, ticket.ticket_code);
                } else {
                    qrPlaceholder.innerHTML = 'No Ticket Code';
                }

                if (this.ticketsContainer) this.ticketsContainer.appendChild(cardElement);
            });

        } catch (error) {
            this.showMessage(error.message, 'danger');
        } finally {
            if (this.loadingSpinner) this.loadingSpinner.style.display = 'none';
        }
    }
}