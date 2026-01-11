import type { ReactNode } from 'react'

export interface AppTaskNewWindowProps {
  heading?: string
  children?: ReactNode
  actions?: ReactNode
}

export function AppTaskNewWindow({ heading, children, actions }: AppTaskNewWindowProps) {
  return (
    <section>
      {heading && <header>{heading}</header>}
      <div>{children}</div>
      {actions && <div>{actions}</div>}
    </section>
  )
}

export default AppTaskNewWindow
