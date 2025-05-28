import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["installButton"]
  static values = {
    promptShown: Boolean
  }

  connect() {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.installButtonTarget.classList.add('hidden')
      return
    }

    // Check if the browser supports PWA installation
    if ('serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.deferredPrompt = e
        this.showInstallButton()
      })
    }
  }

  showInstallButton() {
    if (!this.promptShownValue) {
      this.installButtonTarget.classList.remove('hidden')
    }
  }

  async install() {
    if (!this.deferredPrompt) return

    // Show the install prompt
    this.deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice

    // Hide the button regardless of outcome
    this.installButtonTarget.classList.add('hidden')
    this.promptShownValue = true

    // Clear the deferredPrompt
    this.deferredPrompt = null
  }
} 