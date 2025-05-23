import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["select", "newCategory", "input", "button"]

  connect() {
    console.log('Inline category controller connected')
    
    const select = this.selectTarget
    const newCategory = this.newCategoryTarget
    const buttons = this.buttonTargets
    const input = this.inputTarget

    if (!select || !newCategory || !buttons || !input) {
      console.error('Missing required targets:', {
        select: !!select,
        newCategory: !!newCategory,
        buttons: !!buttons,
        input: !!input
      })
      return
    }

    console.log('Found targets:', {
      select: select.tagName,
      newCategory: newCategory.tagName,
      buttons: buttons.map(b => b.tagName),
      input: input.tagName
    })

    newCategory.classList.add('hidden')
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        this.createCategory(event)
      }
    })
  }

  toggleNewCategory(event) {
    console.log('Toggle button clicked')
    if (event) {
      event.preventDefault()
    }
    const select = this.selectTarget
    const newCategory = this.newCategoryTarget
    const buttons = this.buttonTargets
    const input = this.inputTarget

    if (select.classList.contains('hidden')) {
      // Switch back to select
      select.classList.remove('hidden')
      newCategory.classList.add('hidden')
      buttons.forEach(button => {
        if (button.textContent === 'Cancel') {
          button.textContent = 'Add New Category'
        }
      })
      input.value = ''
    } else {
      // Switch to new category input
      select.classList.add('hidden')
      newCategory.classList.remove('hidden')
      input.focus()
      buttons.forEach(button => {
        if (button.textContent === 'Add New Category') {
          button.textContent = 'Cancel'
        }
      })
    }
  }

  async createCategory() {
    const input = this.inputTarget
    const select = this.selectTarget
    const value = input.value.trim()

    if (!value) {
      alert('Please enter a category name')
      return
    }

    try {
      // Get the user_id from the form
      const form = select.closest('form')
      if (!form) {
        throw new Error('Could not find form element')
      }

      // Get the user_id from the form
      const userId = form.querySelector('input[name="commitment[user_id]"]')?.value || 
                    form.querySelector('input[name="user_id"]')?.value
      if (!userId) {
        throw new Error('Could not find user_id in form')
      }
      
      console.log('Creating category with params:', {
        name: value,
        user_id: userId
      })
      
      const response = await fetch('/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
          category: {
            name: value,
            user_id: userId
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        })
        throw new Error('Failed to create category')
      }

      const data = await response.json()
      console.log('Category created:', data)
      
      // Add the new category to the select
      const option = document.createElement('option')
      option.value = data.id
      option.textContent = data.name
      select.appendChild(option)
      
      // Select the new category
      select.value = data.id
      
      // Trigger change event to update any associated form elements
      const event = new Event('change', { bubbles: true })
      select.dispatchEvent(event)
      
      // Switch back to select
      this.toggleNewCategory()
      
      // Update the hidden category_id field
      const hiddenInput = form.querySelector('input[name="commitment[category_id]"]')
      if (hiddenInput) {
        hiddenInput.value = data.id
      }
      
      // Show success message using Catalyst Alert component
      const alertElement = document.querySelector('.alert')
      if (alertElement) {
        alertElement.dataset.alertMessage = `Successfully created category: ${data.name}`
        alertElement.classList.remove('hidden')
        const alertController = alertElement.closest('[data-controller="alert"]')
        if (alertController) {
          // Use Catalyst Alert's show method
          const alertControllerInstance = alertController.controller
          if (alertControllerInstance && typeof alertControllerInstance.show === 'function') {
            alertControllerInstance.show()
          }
        }
      }
      
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      alert('Failed to create category. Please try again.')
    }
  }
}
