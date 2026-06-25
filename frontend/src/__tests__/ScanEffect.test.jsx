import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ScanEffect } from '../components/ScanEffect'

describe('ScanEffect', () => {
  it('renders when active', () => {
    const { container } = render(<ScanEffect isActive={true} />)
    expect(container.querySelector('div[class*="aspect-square"]')).toBeInTheDocument()
  })

  it('does not render when inactive', () => {
    const { container } = render(<ScanEffect isActive={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays QR code placeholder', () => {
    const { container } = render(<ScanEffect isActive={true} />)
    const qrGrid = container.querySelector('div[class*="grid"]')
    expect(qrGrid).toBeInTheDocument()
  })

  it('renders scanning beam element', () => {
    const { container } = render(<ScanEffect isActive={true} />)
    const beam = container.querySelector('div[style*="background"]')
    expect(beam).toBeInTheDocument()
  })

  it('renders all corner brackets', () => {
    const { container } = render(<ScanEffect isActive={true} />)
    const brackets = container.querySelectorAll('div[class*="border"]')
    expect(brackets.length).toBeGreaterThanOrEqual(4)
  })

  it('applies custom color prop to scan beam', () => {
    const customColor = '#FF00FF'
    const { container } = render(<ScanEffect isActive={true} color={customColor} />)
    const beam = container.querySelector('div[style*="background"]')
    expect(beam.style.boxShadow).toContain('FF00FF')
  })

  it('uses default cyan color when not specified', () => {
    const { container } = render(<ScanEffect isActive={true} />)
    const beam = container.querySelector('div[style*="background"]')
    expect(beam).toBeInTheDocument()
  })

  it('has proper overflow hidden to clip scanning effect', () => {
    const { container } = render(<ScanEffect isActive={true} />)
    const mainDiv = container.querySelector('div[class*="overflow"]')
    expect(mainDiv.className).toContain('overflow-hidden')
  })

  it('displays QR code label text', () => {
    const { container } = render(<ScanEffect isActive={true} />)
    const text = container.querySelector('p')
    expect(text.textContent).toBe('QR Code')
  })

  it('renders with rounded corners', () => {
    const { container } = render(<ScanEffect isActive={true} />)
    const mainDiv = container.querySelector('div[class*="rounded"]')
    expect(mainDiv.className).toContain('rounded-lg')
  })
})
