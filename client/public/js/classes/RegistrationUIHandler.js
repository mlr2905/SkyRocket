
export class RegistrationUIHandler {
    #elements;

    constructor(elements) {
        this.#elements = elements;
    }

    showTab(n, onFinishHandler) {
        const tabs = this.#elements.tabs;
        tabs[n].style.display = "block";

        this.#elements.backBtn.style.display = (n === 0) ? "none" : "inline";
        
        if (n === (tabs.length - 1)) {
            this.#elements.nextBtn.innerHTML = "Finish";
            this.#elements.nextBtn.removeEventListener('click', this.#elements.nextPrevHandler);
            this.#elements.nextBtn.addEventListener('click', onFinishHandler);
        } else {
            this.#elements.nextBtn.innerHTML = "Next";
            this.#elements.nextBtn.removeEventListener('click', onFinishHandler);
            this.#elements.nextBtn.addEventListener('click', this.#elements.nextPrevHandler);
        }
        
        this.updateStepIndicator(n);
    }

    updateStepIndicator(n) {
        const steps = this.#elements.steps;
        for (let i = 0; i < steps.length; i++) {
            steps[i].className = steps[i].className.replace(" active", "");
        }
        steps[n].className += " active";
    }

    markStepAsFinished(n) {
        this.#elements.steps[n].className += " finish";
    }

    togglePasswordVisibility(icon) {
        let passwordField = icon.previousElementSibling;
        if (passwordField && (passwordField.type === "password" || passwordField.type === "text")) {
            if (passwordField.type === "password") {
                passwordField.type = "text";
                icon.src = "/eye.png";
            } else {
                passwordField.type = "password";
                icon.src = "/eye.gif";
            }
        }
    }

    showLoading() {
        this.#elements.loadingIcon.style.display = 'block';
    }

    hideLoading() {
        this.#elements.loadingIcon.style.display = 'none';
    }

    showMessage(message) {
        this.#elements.successMessage.textContent = message;
    }
}