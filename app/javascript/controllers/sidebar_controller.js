import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["backdrop", "panel"]

  connect() {
    console.log("Sidebar controller connected")
  }

  open() {
    console.log("Opening sidebar")
    // Remove hidden classes first
    this.panelTarget.classList.remove("hidden")
    this.backdropTarget.classList.remove("hidden")
    
    // Force a reflow to ensure the transition works
    this.panelTarget.offsetHeight
    
    // Enable backdrop and show panel
    this.backdropTarget.classList.remove("opacity-0")
    this.backdropTarget.classList.remove("pointer-events-none")
    this.panelTarget.classList.remove("-translate-x-full")
  }

  close() {
    console.log("Closing sidebar")
    // Hide panel and backdrop
    this.panelTarget.classList.add("-translate-x-full")
    this.backdropTarget.classList.add("opacity-0")
    this.backdropTarget.classList.add("pointer-events-none")
    
    // Hide elements after transition
    setTimeout(() => {
      this.panelTarget.classList.add("hidden")
      this.backdropTarget.classList.add("hidden")
    }, 300) // Match transition duration
  }
} 