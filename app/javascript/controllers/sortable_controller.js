import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list"]

  connect() {
    // Drag and drop events
    this.listTarget.addEventListener("dragstart", this.handleDragStart.bind(this))
    this.listTarget.addEventListener("dragover", this.handleDragOver.bind(this))
    this.listTarget.addEventListener("dragleave", this.handleDragLeave.bind(this))
    this.listTarget.addEventListener("drop", this.handleDrop.bind(this))
    this.listTarget.addEventListener("dragend", this.handleDragEnd.bind(this))

    // Touch events
    this.listTarget.addEventListener("touchstart", this.handleTouchStart.bind(this))
    this.listTarget.addEventListener("touchmove", this.handleTouchMove.bind(this))
    this.listTarget.addEventListener("touchend", this.handleTouchEnd.bind(this))
    this.listTarget.addEventListener("touchcancel", this.handleTouchEnd.bind(this))

    this.insertionIndicator = null;
    this.touchStartY = null;
    this.touchStartX = null;
    this.touchStartTime = null;
    this.touchThreshold = 10; // pixels
    this.touchTimeThreshold = 200; // milliseconds
    this.touchMoved = false;
    this.touchItem = null;
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

  handleTouchStart(event) {
    const item = event.target.closest("li")
    if (!item) return

    this.touchStartY = event.touches[0].clientY
    this.touchStartX = event.touches[0].clientX
    this.touchStartTime = Date.now()
    this.touchMoved = false
    this.touchItem = item

    // Add a small delay to prevent accidental drags
    setTimeout(() => {
      if (this.touchItem === item) {
        item.classList.add("opacity-50")
      }
    }, 100)
  }

  handleTouchMove(event) {
    if (!this.touchItem) return

    const touch = event.touches[0]
    const deltaY = touch.clientY - this.touchStartY
    const deltaX = touch.clientX - this.touchStartX
    const timeElapsed = Date.now() - this.touchStartTime

    // Only start moving if we've moved enough pixels and enough time has passed
    if (!this.touchMoved && 
        Math.abs(deltaY) > this.touchThreshold && 
        timeElapsed > this.touchTimeThreshold) {
      this.touchMoved = true
      event.preventDefault() // Prevent scrolling while dragging
    }

    if (this.touchMoved) {
      const item = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("li")
      if (item && item !== this.touchItem) {
        this.handleDragOver({
          preventDefault: () => {},
          clientY: touch.clientY,
          target: item
        })
      }
    }
  }

  handleTouchEnd(event) {
    if (!this.touchItem) return

    if (this.touchMoved) {
      const item = document.elementFromPoint(
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY
      )?.closest("li")

      if (item) {
        this.handleDrop({
          preventDefault: () => {},
          target: item
        })
      }
    }

    this.touchItem.classList.remove("opacity-50")
    this.touchItem = null
    this.touchMoved = false
    this.removeInsertionIndicator()
  }

  removeInsertionIndicator() {
    if (this.insertionIndicator && this.insertionIndicator.parentNode) {
      this.insertionIndicator.parentNode.removeChild(this.insertionIndicator)
      this.insertionIndicator = null
    }
  }
} 