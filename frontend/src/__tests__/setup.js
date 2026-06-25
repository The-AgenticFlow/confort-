/* eslint-disable react/display-name, react/prop-types */
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

vi.mock('framer-motion', () => {
  const createMotionComponent = (Component) =>
    React.forwardRef((props, ref) => {
      const { children, ...rest } = props
      // Filter out Framer Motion specific props
      const filteredRest = Object.keys(rest).reduce((acc, key) => {
        if (!['animate', 'initial', 'transition', 'exit'].includes(key)) {
          acc[key] = rest[key]
        }
        return acc
      }, {})
      return React.createElement(Component, { ref, ...filteredRest }, children)
    })

  return {
    motion: {
      div: createMotionComponent('div'),
      p: createMotionComponent('p'),
      input: createMotionComponent('input'),
      svg: createMotionComponent('svg'),
      path: createMotionComponent('path'),
      button: createMotionComponent('button'),
    },
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
  }
})
