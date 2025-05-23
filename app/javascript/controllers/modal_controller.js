import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["overlay", "content"]

  connect() {
    this.modalOpen = false
    this.initializeEventListeners()
  }

  disconnect() {
    this.removeEventListeners()
  }

  initializeEventListeners() {
    this.overlayTarget.addEventListener('click', () => this.close())
    const closeButton = this.contentTarget.querySelector('[data-action="click->modal#close"]')
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close())
    }
    if (this.formTarget) {
      this.formTarget.addEventListener('submit', (event) => this.handleFormSubmit(event))
    }
  }

  removeEventListeners() {
    this.overlayTarget.removeEventListener('click', () => this.close())
    const closeButton = this.contentTarget.querySelector('[data-action="click->modal#close"]')
    if (closeButton) {
      closeButton.removeEventListener('click', () => this.close())
    }
    if (this.formTarget) {
      this.formTarget.removeEventListener('submit', (event) => this.handleFormSubmit(event))
    }
  }

  open() {
    if (this.modalOpen) return
    this.modalOpen = true
    this.overlayTarget.classList.remove('hidden')
    this.contentTarget.classList.remove('hidden')
  }

  close() {
    if (!this.modalOpen) return
    this.modalOpen = false
    this.overlayTarget.classList.add('hidden')
    this.contentTarget.classList.add('hidden')
  }
}
