import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="commitment-actions"
export default class extends Controller {
  static targets = ["completeButton", "skipButton", "menu"]
  
  // Toggle dropdown menu
  toggleMenu() {
    this.menuTarget.classList.toggle('hidden')
  }
  
  // Handle completion via AJAX
  complete(event) {
    event.preventDefault()
    const button = event.currentTarget
    const url = button.href || button.dataset.url
    
    this.disableButtons()
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").content,
        'Accept': 'application/json'
      },
      credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        // Reload the page to show updated state
        window.location.reload()
      } else {
        this.showError('Failed to complete commitment')
      }
    })
    .catch(error => {
      console.error('Error:', error)
      this.showError('An error occurred')
    })
    .finally(() => {
      this.enableButtons()
    })
  }
  
  // Handle skip via AJAX
  skip(event) {
    event.preventDefault()
    const button = event.currentTarget
    const url = button.href || button.dataset.url
    
    this.disableButtons()
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector("[name='csrf-token']").content,
        'Accept': 'application/json'
      },
      credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        // Reload the page to show updated state
        window.location.reload()
      } else {
        this.showError('Failed to skip commitment')
      }
    })
    .catch(error => {
      console.error('Error:', error)
      this.showError('An error occurred')
    })
    .finally(() => {
      this.enableButtons()
    })
  }
  
  // Disable action buttons during request
  disableButtons() {
    if (this.hasCompleteButtonTarget) {
      this.completeButtonTargets.forEach(btn => {
        btn.disabled = true
        btn.classList.add('opacity-50', 'cursor-not-allowed')
      })
    }
    
    if (this.hasSkipButtonTarget) {
      this.skipButtonTargets.forEach(btn => {
        btn.disabled = true
        btn.classList.add('opacity-50', 'cursor-not-allowed')
      })
    }
  }
  
  // Enable action buttons after request
  enableButtons() {
    if (this.hasCompleteButtonTarget) {
      this.completeButtonTargets.forEach(btn => {
        btn.disabled = false
        btn.classList.remove('opacity-50', 'cursor-not-allowed')
      })
    }
    
    if (this.hasSkipButtonTarget) {
      this.skipButtonTargets.forEach(btn => {
        btn.disabled = false
        btn.classList.remove('opacity-50', 'cursor-not-allowed')
      })
    }
  }
  
  // Show error message
  showError(message) {
    // You can implement a more sophisticated notification system here
    alert(message)
  }
}
