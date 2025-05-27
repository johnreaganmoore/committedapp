// This file is auto-generated.
import { Application } from "@hotwired/stimulus"

// Eager load all controllers defined in the import map under controllers/**/*_controller
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"

const application = Application.start()
eagerLoadControllersFrom("controllers", application)

// Configure Stimulus development experience
application.debug = false
window.Stimulus = application

export { application }
