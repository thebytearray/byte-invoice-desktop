import { ScrollArea } from '@chakra-ui/react'

interface ScrollableTableProps {
  children: React.ReactNode
  /** Max height for vertical scroll; default 400px for list tables */
  maxH?: string | number
}

/**
 * Wraps table content in a ScrollArea for styled scrollbars when content overflows
 * vertically or horizontally. Use for invoice, client, and product lists.
 */
export function ScrollableTable({ children, maxH = '400px' }: ScrollableTableProps) {
  return (
    <ScrollArea.Root size="sm" variant="hover" maxH={maxH} minH="0">
      <ScrollArea.Viewport>
        <ScrollArea.Content minW="0">
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
  )
}
