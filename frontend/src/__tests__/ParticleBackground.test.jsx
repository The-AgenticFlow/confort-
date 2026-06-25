import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ParticleBackground } from '../components/ParticleBackground'

describe('ParticleBackground', () => {
  it('should render particle container', () => {
    const { container } = render(<ParticleBackground count={5} />)
    const particleContainer = container.querySelector('div.fixed.inset-0')
    expect(particleContainer).toBeInTheDocument()
  })

  it('should apply pointer-events-none to prevent interaction', () => {
    const { container } = render(<ParticleBackground count={5} />)
    const particleContainer = container.querySelector('div.pointer-events-none')
    expect(particleContainer).toBeInTheDocument()
  })

  it('should have z-5 layer positioning', () => {
    const { container } = render(<ParticleBackground count={5} />)
    const particleContainer = container.querySelector('div.z-5')
    expect(particleContainer).toBeInTheDocument()
  })

  it('should render particles with color attributes', () => {
    const { container } = render(<ParticleBackground count={30} />)
    let hasCyanColor = false
    let hasPinkColor = false
    let hasBlueColor = false

    const htmlContent = container.innerHTML
    if (htmlContent.includes('rgba(0, 255, 204')) {
      hasCyanColor = true
    }
    if (htmlContent.includes('rgba(255, 0, 255')) {
      hasPinkColor = true
    }
    if (htmlContent.includes('rgba(0, 153, 255')) {
      hasBlueColor = true
    }

    expect(hasCyanColor || hasPinkColor || hasBlueColor).toBe(true)
  })

  it('should have will-change-transform for performance', () => {
    const { container } = render(<ParticleBackground count={5} />)
    const particles = container.querySelectorAll('div.will-change-transform')
    expect(particles.length).toBeGreaterThan(0)
  })

  it('should render with default count when not specified', () => {
    const { container } = render(<ParticleBackground />)
    const particleContainer = container.querySelector('div.fixed.inset-0')
    expect(particleContainer).toBeInTheDocument()
  })

  it('should be positioned fixed and cover full viewport', () => {
    const { container } = render(<ParticleBackground count={5} />)
    const particleContainer = container.querySelector('div.fixed.inset-0')
    expect(particleContainer).toHaveClass('fixed')
    expect(particleContainer).toHaveClass('inset-0')
    expect(particleContainer).toHaveClass('overflow-hidden')
  })

  it('should render particles with different sizes', () => {
    const { container } = render(<ParticleBackground count={20} />)
    const htmlContent = container.innerHTML
    expect(htmlContent).toMatch(/width.*px/)
    expect(htmlContent).toMatch(/height.*px/)
  })

  it('should render particles in container with overflow hidden', () => {
    const { container } = render(<ParticleBackground count={5} />)
    const particleContainer = container.querySelector('div.overflow-hidden')
    expect(particleContainer).toBeInTheDocument()
  })
})
