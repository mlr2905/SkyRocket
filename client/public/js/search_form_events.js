
document.addEventListener('DOMContentLoaded', function() {

    const subtractButton = document.getElementById('button-subtract');
    if (subtractButton) {
        subtractButton.addEventListener('click', () => update('subtract'));
    }

    const addButton = document.getElementById('button-add');
    if (addButton) {
        addButton.addEventListener('click', () => update('add'));
    }

    const searchButton = document.getElementById('search');
    if (searchButton) {
        searchButton.addEventListener('click', toggleSearchIcon);
    }

});