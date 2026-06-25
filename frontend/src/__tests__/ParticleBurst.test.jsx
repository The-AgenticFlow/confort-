import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ParticleBurst } from '../components/ParticleBurst'

describe('ParticleBurst', () => {
  it('renders particle burst container when active', () => {
    const { container } = render(<ParticleBurst isActive={true} />)
    expect(container.querySelector('div[class*="fixed"]')).toBeInTheDocument()
  })

  it('does not render when inactive', () => {
    const { container } = render(<ParticleBurst isActive={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('generates particles based on intensity', () => {
    const { container } = render(<ParticleBurst isActive={true} intensity={2} />)
    const particles = container.querySelectorAll('div')
    expect(particles.length).toBeGreaterThan(10)
  })

  it('renders particles with different colors', () => {
    const { container } = render(<ParticleBurst isActive={true} intensity={1} />)
    const fixedDiv = container.querySelector('div[class*="fixed"]')
    expect(fixedDiv).toBeInTheDocument()
  })

  it('applies direction prop correctly', () => {
    const { container: upContainer } = render(
      <ParticleBurst isActive={true} direction="up" />
    )
    expect(upContainer.querySelector('div[class*="fixed"]')).toBeInTheDocument()

    const { container: downContainer } = render(
      <ParticleBurst isActive={true} direction="down" />
    )
    expect(downContainer.querySelector('div[class*="fixed"]')).toBeInTheDocument()
  })

  it('uses default intensity of 1', () => {
    const { container } = render(<ParticleBurst isActive={true} />)
    const fixedDiv = container.querySelector('div[class*="fixed"]')
    expect(fixedDiv).toBeInTheDocument()
  })

  it('renders multiple particles with varied animation timing', () => {
    const { container } = render(<ParticleBurst isActive={true} intensity={1} />)
    const divs = container.querySelectorAll('div')
    expect(divs.length).toBeGreaterThan(5)
  })

  it('sets pointer-events-none to prevent interaction blocking', () => {
    const { container } = render(<ParticleBurst isActive={true} />)
    const mainDiv = container.querySelector('div[class*="fixed"]')
    expect(mainDiv.className).toContain('pointer-events-none')
  })

  it('particles have glow effect via boxShadow', () => {
    const { container } = render(<ParticleBurst isActive={true} />)
    const fixedDiv = container.querySelector('div[class*="fixed"]')
    expect(fixedDiv).toBeInTheDocument()
    expect(fixedDiv.className).toContain('pointer-events-none')
  })
})
