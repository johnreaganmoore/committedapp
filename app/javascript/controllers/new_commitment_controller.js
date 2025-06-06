import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["buttonContainer", "formContainer"]

  showForm() {
    this.buttonContainerTarget.classList.add("hidden")
    this.formContainerTarget.classList.remove("hidden")
  }

  hideForm() {
    this.buttonContainerTarget.classList.remove("hidden")
    this.formContainerTarget.classList.add("hidden")
    this.formContainerTarget.querySelector("form").reset()
  }

  async create(event) {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)

    try {
      const response = await fetch("/commitments", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content,
          "Accept": "application/json"
        }
      })

      const data = await response.json()

      if (response.ok) {
        // Hide the form
        this.hideForm()

        // Show success message
        const alertElement = document.querySelector('[data-controller="alert"]')
        if (alertElement) {
          alertElement.dataset.alertMessage = "Commitment created successfully!"
          alertElement.classList.remove("hidden")
          const alertController = alertElement.closest('[data-controller="alert"]')
          if (alertController) {
            const alertControllerInstance = alertController.controller
            if (alertControllerInstance && typeof alertControllerInstance.show === 'function') {
              alertControllerInstance.show()
            }
          }
        }

        // Create the new commitment element
        const frequency = formData.get("commitment[frequency]")
        const categoryId = formData.get("commitment[category_id]")
        const column = document.querySelector(`[data-commitment-target="column"]:has([value="${frequency}"])`)
        
        // Find the category section or create it if it doesn't exist
        let categorySection = column.querySelector(`[data-category-id="${categoryId}"]`)
        if (!categorySection) {
          // Get the category name from the select element
          const categorySelect = form.querySelector('select[name="commitment[category_id]"]')
          const categoryName = categorySelect.options[categorySelect.selectedIndex].text
          
          // Create new category section
          categorySection = document.createElement('div')
          categorySection.className = 'space-y-3'
          categorySection.dataset.categoryId = categoryId
          
          // Add category header
          const categoryHeader = document.createElement('h4')
          categoryHeader.className = 'text-sm font-medium text-gray-700 px-2'
          categoryHeader.textContent = categoryName
          categorySection.appendChild(categoryHeader)
          
          // Insert the new category section before the new commitment form
          column.insertBefore(categorySection, this.element)
        }
        
        const newCommitment = document.createElement('div')
        newCommitment.className = 'bg-white rounded-lg shadow p-4 pb-2'
        newCommitment.innerHTML = `
          <div class="flex justify-between space-x-3">
            <div class="flex items-start space-x-3">
              <form class="flex-shrink-0" data-controller="commitment">
                <input type="hidden" name="commitment[title]" value="${formData.get("commitment[title]")}">
                <input type="hidden" name="commitment[description]" value="${formData.get("commitment[description]") || ''}">
                <input type="hidden" name="commitment[category_id]" value="${categoryId}">
                <input type="hidden" name="commitment[frequency]" value="${frequency}">
                <input type="hidden" name="commitment[completed]" value="false">
                <input type="checkbox" 
                       name="commitment[completed]" 
                       class="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                       data-action="change->commitment#toggle"
                       data-commitment-target="checkbox">
              </form>
              <div class="flex-grow">
                <h4 class="text-sm font-medium text-gray-900">${formData.get("commitment[title]")}</h4>
                ${formData.get("commitment[description]") ? `<p class="text-xs text-gray-500 mt-1">${formData.get("commitment[description]")}</p>` : ''}
              </div>
            </div>
            <a href="/commitments/${data.id}/edit" class="flex-shrink-0 text-gray-400 hover:text-gray-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </a>
          </div>
        `
        
        // Insert the new commitment at the end of the category section
        categorySection.appendChild(newCommitment)
        
        // Update the count
        const countElement = column.closest('.bg-gray-100').querySelector('[data-commitment-target="count"]')
        const counts = countElement.textContent.match(/(\d+)\/(\d+)/)
        if (counts) {
          const [_, completed, total] = counts
          countElement.textContent = `(${completed}/${parseInt(total) + 1})`
        }
      } else {
        // Show error message
        const alertElement = document.querySelector('[data-controller="alert"]')
        if (alertElement) {
          alertElement.dataset.alertMessage = data.errors.join(", ")
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
      console.error("Error creating commitment:", error)
      // Show error message
      const alertElement = document.querySelector('[data-controller="alert"]')
      if (alertElement) {
        alertElement.dataset.alertMessage = "Failed to create commitment. Please try again."
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