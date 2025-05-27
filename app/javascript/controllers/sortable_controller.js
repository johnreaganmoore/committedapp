import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["list", "item"]

  connect() {
    console.log("Sortable controller connected")
    console.log("Controller element:", this.element)
    console.log("List target:", this.listTarget)
    console.log("Items:", this.itemTargets.length)
    
    if (!this.listTarget) {
      console.error("List target not found!")
      return
    }

    // Add a test touch event to verify touch events are working
    document.addEventListener("touchstart", (e) => {
      console.log("Document touch start - touch events are working")
    }, { passive: true })

    // Drag and drop events
    this.listTarget.addEventListener("dragstart", (e) => {
      console.log("Drag start event triggered")
      this.handleDragStart(e)
    })
    this.listTarget.addEventListener("dragover", (e) => {
      console.log("Drag over event triggered")
      this.handleDragOver(e)
    })
    this.listTarget.addEventListener("dragleave", (e) => {
      console.log("Drag leave event triggered")
      this.handleDragLeave(e)
    })
    this.listTarget.addEventListener("drop", (e) => {
      console.log("Drop event triggered")
      this.handleDrop(e)
    })
    this.listTarget.addEventListener("dragend", (e) => {
      console.log("Drag end event triggered")
      this.handleDragEnd(e)
    })

    // Touch events - make them all passive: false to ensure we can prevent default
    this.listTarget.addEventListener("touchstart", (e) => {
      console.log("Touch start event triggered")
      this.handleTouchStart(e)
    }, { passive: false })
    
    this.listTarget.addEventListener("touchmove", (e) => {
      console.log("Touch move event triggered")
      this.handleTouchMove(e)
    }, { passive: false })
    
    this.listTarget.addEventListener("touchend", (e) => {
      console.log("Touch end event triggered")
      this.handleTouchEnd(e)
    }, { passive: false })
    
    this.listTarget.addEventListener("touchcancel", (e) => {
      console.log("Touch cancel event triggered")
      this.handleTouchEnd(e)
    }, { passive: false })

    this.insertionIndicator = null;
    this.touchStartY = null;
    this.touchStartX = null;
    this.touchStartTime = null;
    this.touchThreshold = 3; // Reduced threshold for easier activation
    this.touchTimeThreshold = 50; // Reduced time threshold for faster response
    this.touchMoved = false;
    this.touchItem = null;
    this.touchStartScrollY = null;
  }

  handleDragStart(event) {
    console.log("Drag start")
    const item = event.target.closest("[data-sortable-target='item']")
    if (!item) {
      console.log("No item found in drag start")
      return
    }
    item.classList.add("opacity-50")
    item.classList.add("bg-gray-50")
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", item.dataset.id)
  }

  handleTouchStart(event) {
    console.log("Touch start")
    const item = event.target.closest("[data-sortable-target='item']")
    if (!item) {
      console.log("No list item found")
      return
    }

    // Prevent default to avoid any scrolling
    event.preventDefault()

    this.touchStartY = event.touches[0].clientY
    this.touchStartX = event.touches[0].clientX
    this.touchStartTime = Date.now()
    this.touchStartScrollY = window.scrollY
    this.touchMoved = false
    this.touchItem = item

    console.log("Touch start details:", {
      startY: this.touchStartY,
      startX: this.touchStartX,
      item: item.dataset.id,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY
    })

    // Add visual feedback immediately
    item.classList.add("opacity-50")
    item.classList.add("bg-gray-50")
  }

  handleTouchMove(event) {
    if (!this.touchItem) {
      console.log("No touch item found in touch move")
      return
    }

    const touch = event.touches[0]
    const deltaY = touch.clientY - this.touchStartY
    const deltaX = touch.clientX - this.touchStartX
    const timeElapsed = Date.now() - this.touchStartTime

    console.log("Touch move details:", {
      deltaY,
      deltaX,
      timeElapsed,
      touchMoved: this.touchMoved,
      currentY: touch.clientY,
      currentX: touch.clientX,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY
    })

    // Only start moving if we've moved enough pixels and enough time has passed
    if (!this.touchMoved && 
        Math.abs(deltaY) > this.touchThreshold && 
        timeElapsed > this.touchTimeThreshold) {
      console.log("Starting drag", { deltaY, deltaX, timeElapsed })
      this.touchMoved = true
      event.preventDefault() // Prevent scrolling while dragging
    }

    if (this.touchMoved) {
      event.preventDefault() // Always prevent scrolling while dragging
      
      // Calculate the actual position considering scroll
      const scrollDelta = window.scrollY - this.touchStartScrollY
      const actualY = touch.clientY + scrollDelta

      // Get the element at the touch point, considering the viewport
      const item = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("[data-sortable-target='item']")
      if (item && item !== this.touchItem) {
        console.log("Found target item:", item.dataset.id)
        this.handleDragOver({
          preventDefault: () => {},
          clientY: touch.clientY,
          target: item
        })
      }
    }
  }

  handleTouchEnd(event) {
    console.log("Touch end")
    if (!this.touchItem) {
      console.log("No touch item found in touch end")
      return
    }

    if (this.touchMoved) {
      const touch = event.changedTouches[0]
      
      // Get the element at the touch point
      const item = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      )?.closest("[data-sortable-target='item']")

      if (item) {
        console.log("Dropping on item:", item.dataset.id)
        this.handleDrop({
          preventDefault: () => {},
          target: item
        })
      }
    }

    this.touchItem.classList.remove("opacity-50")
    this.touchItem.classList.remove("bg-gray-50")
    this.touchItem = null
    this.touchMoved = false
    this.removeInsertionIndicator()
  }

  handleDragOver(event) {
    event.preventDefault()
    const item = event.target.closest("[data-sortable-target='item']")
    if (!item) {
      console.log("No item found in drag over")
      return
    }
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

  handleDrop(event) {
    event.preventDefault()
    const item = event.target.closest("[data-sortable-target='item']")
    if (!item) {
      console.log("No item found in drop")
      return
    }
    const draggedItem = this.listTarget.querySelector(".opacity-50")
    if (!draggedItem) {
      console.log("No dragged item found")
      return
    }
    const indicator = this.insertionIndicator
    if (!indicator) {
      console.log("No indicator found")
      return
    }
    const newPosition = Array.from(this.listTarget.children).indexOf(indicator) + 1

    console.log("Moving item to position:", newPosition)

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
    const item = event.target.closest("[data-sortable-target='item']")
    if (item) {
      item.classList.remove("opacity-50")
      item.classList.remove("bg-gray-50")
    }
    this.removeInsertionIndicator()
  }

  handleDragLeave(event) {
    // Remove indicator if leaving the list
    if (!this.listTarget.contains(event.relatedTarget)) {
      this.removeInsertionIndicator()
    }
  }

  removeInsertionIndicator() {
    if (this.insertionIndicator && this.insertionIndicator.parentNode) {
      this.insertionIndicator.parentNode.removeChild(this.insertionIndicator)
      this.insertionIndicator = null
    }
  }
}



