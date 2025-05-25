import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list"]

  connect() {
    this.listTarget.addEventListener("dragstart", this.handleDragStart.bind(this))
    this.listTarget.addEventListener("dragover", this.handleDragOver.bind(this))
    this.listTarget.addEventListener("dragleave", this.handleDragLeave.bind(this))
    this.listTarget.addEventListener("drop", this.handleDrop.bind(this))
    this.listTarget.addEventListener("dragend", this.handleDragEnd.bind(this))
    this.insertionIndicator = null;
  }

  handleDragStart(event) {
    const item = event.target.closest("li")
    if (!item) return
    item.classList.add("opacity-50")
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", item.dataset.id)
  }

  handleDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    const item = event.target.closest("li")
    if (!item) return
    const draggedItem = this.listTarget.querySelector(".opacity-50")
    if (!draggedItem || draggedItem === item) return

    // Remove any existing indicator
    this.removeInsertionIndicator()

    // Create and insert indicator
    const indicator = document.createElement("li")
    indicator.className = "insertion-indicator"
    // Find if we should insert before or after
    const rect = item.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    if (event.clientY < midpoint) {
      item.parentNode.insertBefore(indicator, item)
    } else {
      item.parentNode.insertBefore(indicator, item.nextSibling)
    }
    this.insertionIndicator = indicator
  }

  handleDragLeave(event) {
    // Remove indicator if leaving the list
    if (!this.listTarget.contains(event.relatedTarget)) {
      this.removeInsertionIndicator()
    }
  }

  handleDrop(event) {
    event.preventDefault()
    const item = event.target.closest("li")
    if (!item) return
    const draggedItem = this.listTarget.querySelector(".opacity-50")
    if (!draggedItem) return
    const indicator = this.insertionIndicator
    if (!indicator) return
    const newPosition = Array.from(this.listTarget.children).indexOf(indicator) + 1

    // Move the dragged item in the DOM for instant feedback
    if (indicator.parentNode) {
      indicator.parentNode.insertBefore(draggedItem, indicator)
    }
    this.removeInsertionIndicator()
    fetch(`/categories/${draggedItem.dataset.id}/reposition`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({ position: newPosition })
    })
  }

  handleDragEnd(event) {
    const item = event.target.closest("li")
    if (item) {
      item.classList.remove("opacity-50")
    }
    this.removeInsertionIndicator()
  }

  removeInsertionIndicator() {
    if (this.insertionIndicator && this.insertionIndicator.parentNode) {
      this.insertionIndicator.parentNode.removeChild(this.insertionIndicator)
      this.insertionIndicator = null
    }
  }
} 