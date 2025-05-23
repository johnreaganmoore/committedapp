import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["checkbox"]

  async toggle(event) {
    const form = event.target.closest('form')
    const formData = new FormData(form)
    const checkbox = this.checkboxTarget

    // Get the original frequency from the commitment's data attribute
    const commitmentElement = form.closest('[data-commitment-frequency]')
    const originalFrequency = commitmentElement ? commitmentElement.dataset.commitmentFrequency : "daily"

    // Ensure all required fields are set
    formData.set("commitment[completed]", checkbox.checked)
    formData.set("commitment[frequency]", originalFrequency)
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
        // Update the count
        const column = form.closest('[data-commitment-target="column"]')
        const countElement = column.closest('.bg-gray-100').querySelector('[data-commitment-target="count"]')
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
} 