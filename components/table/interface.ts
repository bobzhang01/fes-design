import { Ref } from 'vue';
import { getCellValue } from './helper';
import useTableColumn from './useTableColumn';
import useTableEvent from './useTableEvent';
import useTableSelect from './useTableSelect';
import useTableExpand from './useTableExpand';
import useTableStyle from './useTableStyle';
import useTableDrag from './useTableDrag';
import type { TableProps } from './table';

export type RowType = Record<string, any>;
export type RowKey = string | ((row: RowType) => string | number);

export interface ActionType {
    label: string | number;
    func: (row: object) => void;
}

export interface TableInst
    extends ReturnType<typeof useTableColumn>,
        ReturnType<typeof useTableEvent>,
        ReturnType<typeof useTableSelect>,
        ReturnType<typeof useTableExpand>,
        ReturnType<typeof useTableStyle>,
        ReturnType<typeof useTableDrag> {
    rootProps: TableProps;
    getRowKey: ({ row }: { row: RowType }) => string | number | RowType;
    getCellValue: typeof getCellValue;
    tableId: string;
    showData: Ref<object[]>;
}
