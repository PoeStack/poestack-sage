import '@tanstack/react-table'

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    headerWording?: string
    className?: string
    // maxWidth?: number
    staticResizing?: boolean
    removePadding?: boolean
  }
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: number | string) => void
  }
}
