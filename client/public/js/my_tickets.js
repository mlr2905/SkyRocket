import * as C from './utils/constants.js'; 
import { PLANE_LAYOUTS } from './planeLayouts.js'; 

let ticketsContainer, ticketTemplate, messageContainer, loadingSpinner;
let boundHandleClick;


export function init() {
    ticketsContainer = document.getElementById('tickets-container');
    ticketTemplate = document.getElementById('ticket-card-template');
    messageContainer = document.getElementById('message-container');
    loadingSpinner = document.getElementById('loading-spinner'); // Global one

    boundHandleClick = handleTicketClick.bind(this);

    if (ticketsContainer) {
        ticketsContainer.addEventListener('click', boundHandleClick);
    }
    
    loadMyTickets();
}


export function destroy() {
    if (ticketsContainer) {
        ticketsContainer.removeEventListener('click', boundHandleClick);
    }

    ticketsContainer = null;
    ticketTemplate = null;
    messageContainer = null;
    loadingSpinner = null;
    boundHandleClick = null;
}


function handleTicketClick(event) {
    const cancelButton = event.target.closest('.cancel-ticket-btn');
    if (cancelButton) {
        handleCancelTicket(event);
    }
}

function showMessage(message, type = 'danger') {
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.className = `alert alert-${type}`;
        messageContainer.style.display = 'block';
    }
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
    
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You want to cancel ticket ${ticketId}? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel it!'
    });

    if (!result.isConfirmed) {
        return;
    }

    if (loadingSpinner) loadingSpinner.style.display = 'block';
    
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
             if (ticketsContainer && ticketsContainer.childElementCount === 0) {
                 showMessage('You have no remaining tickets.', 'info');
             }
        }, 500);

    } catch (error) {
        showMessage(error.message, 'danger');
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
}

function getSeatName(plane_id, chair_id) {
    // ... (same as your original)
    if (!plane_id || !chair_id || !PLANE_LAYOUTS[plane_id]) {
        return 'N/A';
    }
    const layout = PLANE_LAYOUTS[plane_id];
    const seat = layout.find(s => s.id === chair_id);
    return seat ? seat.name : 'N/A';
}

async function loadMyTickets() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    try {
        const response = await fetch(C.API_MY_TICKETS_URL, {
            credentials: 'include' 
        });

        if (!response.ok) {
            if (response.status === 401) {
                showMessage('You are not logged in. Redirecting to login page...', 'warning');
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
            showMessage('You have not purchased any tickets yet.', 'info');
            if (ticketsContainer) ticketsContainer.innerHTML = '';
            return;
        }
        
        if (ticketsContainer) ticketsContainer.innerHTML = '';

        tickets.forEach(ticket => {
            if (!ticketTemplate) return;
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

            const seatNameEl = card.querySelector('[data-field="seat_name"]');
            const chairName = getSeatName(ticket.plane_id, ticket.chair_id);
            if (chairName !== 'N/A') {
                seatNameEl.textContent = `Seat: ${chairName}`;
            } else {
                seatNameEl.style.display = 'none'; 
            }
            
            const qrPlaceholder = card.querySelector('.qrcode-placeholder');
            if (ticket.ticket_code) {
                generateQRCode(qrPlaceholder, ticket.ticket_code);
            } else {
                qrPlaceholder.innerHTML = 'No Ticket Code';
            }

            // REMOVED: No more adding event listener here

            if (ticketsContainer) ticketsContainer.appendChild(cardElement);
        });

    } catch (error) {
        showMessage(error.message, 'danger');
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
}