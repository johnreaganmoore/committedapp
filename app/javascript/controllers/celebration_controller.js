import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["modal", "message"]

  connect() {
    console.log('Celebration controller connected')
    this.canvas = null
    this.animationFrame = null
  }

  disconnect() {
    if (this.canvas) {
      this.canvas.remove()
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  }

  show(customMessage = null) {
    if (customMessage) {
      this.messageTarget.textContent = customMessage
    }
    this.modalTarget.classList.remove('hidden')
    this.startConfetti()
  }

  hide() {
    this.modalTarget.classList.add('hidden')
    if (this.canvas) {
      this.canvas.remove()
      this.canvas = null
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  startConfetti() {
    // Create canvas if it doesn't exist
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.canvas.style.position = 'fixed'
      this.canvas.style.top = '0'
      this.canvas.style.left = '0'
      this.canvas.style.width = '100%'
      this.canvas.style.height = '100%'
      this.canvas.style.pointerEvents = 'none'
      this.canvas.style.zIndex = '50'
      document.body.appendChild(this.canvas)
    }

    const ctx = this.canvas.getContext('2d')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    // Create particles
    const particles = []
    const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD']
    const particleCount = 400 // Even more particles

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * this.canvas.width,
        y: -20,
        size: Math.random() * 6 + 3, // Smaller particles for better effect at high speed
        speed: Math.random() * 6 + 4, // Much faster speed (4-10 range)
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4 // Much faster rotation
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      
      let activeParticles = 0
      particles.forEach(particle => {
        if (particle.y < this.canvas.height) {
          activeParticles++
          particle.y += particle.speed
          particle.rotation += particle.rotationSpeed
          
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate(particle.rotation * Math.PI / 180)
          ctx.fillStyle = particle.color
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
          ctx.restore()
        }
      })

      if (activeParticles > 0) {
        this.animationFrame = requestAnimationFrame(animate)
      } else {
        // When all particles have fallen, clear the canvas but keep the modal open
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame)
          this.animationFrame = null
        }
      }
    }

    animate()
  }
} 