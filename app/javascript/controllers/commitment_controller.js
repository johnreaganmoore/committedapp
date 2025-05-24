import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["checkbox", "form", "title", "description", "category", "frequency", "startDate", "endDate", "milestones"]
  static values = {
    url: String
  }

  connect() {
    console.log('Commitment controller connected')
  }

  async toggle(event) {
    event.preventDefault()
    const form = event.target.closest('form')
    const formData = new FormData(form)
    const checkbox = this.checkboxTarget

    // Get the frequency from the column
    const column = form.closest('[data-frequency]')
    const frequency = column ? column.dataset.frequency : null
    console.log('Commitment frequency from column:', frequency)

    if (!frequency) {
      console.error('No frequency found for commitment column')
      return
    }

    // Ensure all required fields are set
    formData.set("commitment[completed]", checkbox.checked)
    formData.set("commitment[frequency]", frequency)
    formData.set("commitment[title]", formData.get("commitment[title]") || "")
    formData.set("commitment[description]", formData.get("commitment[description]") || "")
    formData.set("commitment[category_id]", formData.get("commitment[category_id]") || "")
    formData.set("commitment[start_date]", formData.get("commitment[start_date]") || "")
    formData.set("commitment[end_date]", formData.get("commitment[end_date]") || "")

    try {
      const response = await fetch(form.action, {
        method: "PATCH",
        body: formData,
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
          "Accept": "application/json"
        }
      })

      const data = await response.json()

      if (response.ok) {
        // Update the count in the correct column
        const countElement = column.querySelector('[data-commitment-target="count"]')
        const counts = countElement.textContent.match(/(\d+)\/(\d+)/)
        
        if (counts) {
          const [_, completed, total] = counts
          const newCompleted = data.completed ? parseInt(completed) + 1 : parseInt(completed) - 1
          countElement.textContent = `(${newCompleted}/${total})`
        }

        // Show success message
        const alertElement = document.querySelector('[data-controller="alert"]')
        if (alertElement) {
          alertElement.dataset.alertMessage = data.completed ? "Commitment marked as complete! 🎉" : "Commitment marked as incomplete"
          alertElement.classList.remove("hidden")
          const alertController = alertElement.closest('[data-controller="alert"]')
          if (alertController) {
            const alertControllerInstance = alertController.controller
            if (alertControllerInstance && typeof alertControllerInstance.show === 'function') {
              alertControllerInstance.show()
            }
          }
        }

        // Check if all commitments in the column are completed
        console.log(`Checking ${frequency} column for completed commitments`)
        const checkboxes = column.querySelectorAll('input[type="checkbox"]')
        const allCompleted = Array.from(checkboxes).every(checkbox => checkbox.checked)
        console.log('All checkboxes:', checkboxes.length)
        console.log('All completed:', allCompleted)

        if (allCompleted) {
          console.log(`All ${frequency} commitments completed! Showing celebration`)
          const celebrationController = document.querySelector('[data-controller="celebration"]')
          if (celebrationController) {
            const controller = this.application.getControllerForElementAndIdentifier(celebrationController, 'celebration')
            if (controller) {
              // Set appropriate message based on frequency
              const message = this.getCelebrationMessage(frequency)
              controller.show(message)
            } else {
              console.error('Could not find celebration controller instance')
            }
          } else {
            console.error('Could not find celebration controller element')
          }
        }
      } else {
        // Revert the checkbox if the update failed
        checkbox.checked = !checkbox.checked
        
        // Show error message
        const alertElement = document.querySelector('[data-controller="alert"]')
        if (alertElement) {
          alertElement.dataset.alertMessage = data.errors ? data.errors.join(", ") : "Failed to update commitment status"
          alertElement.classList.remove("hidden")
          const alertController = alertElement.closest('[data-controller="alert"]')
          if (alertController) {
            const alertControllerInstance = alertController.controller
            if (alertControllerInstance && typeof alertControllerInstance.show === 'function') {
              alertControllerInstance.show()
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating commitment:", error)
      // Revert the checkbox if there was an error
      checkbox.checked = !checkbox.checked
      
      // Show error message
      const alertElement = document.querySelector('[data-controller="alert"]')
      if (alertElement) {
        alertElement.dataset.alertMessage = "Failed to update commitment status"
        alertElement.classList.remove("hidden")
        const alertController = alertElement.closest('[data-controller="alert"]')
        if (alertController) {
          const alertControllerInstance = alertController.controller
          if (alertControllerInstance && typeof alertControllerInstance.show === 'function') {
            alertControllerInstance.show()
          }
        }
      }
    }
  }

  getCelebrationMessage(frequency) {
    const messages = {
      daily: "You've completed all your daily commitments! 🎉",
      weekly: "You've completed all your weekly commitments! 🌟",
      monthly: "You've completed all your monthly commitments! 🏆",
      quarterly: "You've completed all your quarterly commitments! 🎯",
      yearly: "You've completed all your yearly commitments! 🏅"
    }
    return messages[frequency] || "You've completed all your commitments! 🎉"
  }

  async complete(event) {
    event.preventDefault()
    
    try {
      const response = await fetch(this.urlValue, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Accept': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        // Update the commitment card with the new HTML
        this.element.outerHTML = data.html
        
        // Check if all daily commitments are completed
        const dailyColumn = document.querySelector('[data-frequency="daily"]')
        if (dailyColumn) {
          const incompleteCommitments = dailyColumn.querySelectorAll('[data-completed="false"]')
          if (incompleteCommitments.length === 0) {
            // All daily commitments are completed, show celebration
            const celebrationController = document.querySelector('[data-controller="celebration"]')
            if (celebrationController) {
              const controller = this.application.getControllerForElementAndIdentifier(celebrationController, 'celebration')
              controller.show()
            }
          }
        }
      }
    } catch (error) {
      console.error('Error completing commitment:', error)
    }
  }
} 