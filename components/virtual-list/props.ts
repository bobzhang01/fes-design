/**
 * props declaration for default, item and slot component
 */

import { PropType, VNode } from 'vue';
import { COMMON_PROPS } from '../scrollbar/const';

export type DataSource = any;

export const VirtualProps = {
    dataKey: {
        type: [String, Function] as PropType<
            string | ((dataSource: DataSource) => string | number)
        >,
        required: true,
    },
    dataSources: {
        type: Array as PropType<DataSource[]>,
        required: true,
    },
    keeps: {
        type: Number,
        default: 30,
    },
    extraProps: {
        type: Object,
    },
    estimateSize: {
        type: Number,
        default: 50,
    },
    observeResize: {
        type: Boolean,
        default: true,
    },
    direction: {
        type: String as PropType<'horizontal' | 'vertical'>,
        default: 'vertical', // the other value is horizontal
    },
    start: {
        type: Number,
        default: 0,
    },
    offset: {
        type: Number,
        default: 0,
    },
    topThreshold: {
        type: Number,
        default: 0,
    },
    bottomThreshold: {
        type: Number,
        default: 0,
    },
    pageMode: {
        type: Boolean,
        default: false,
    },
    wrapTag: {
        type: String,
        default: 'div',
    },
    wrapClass: {
        type: String,
        default: '',
    },
    wrapStyle: {
        type: Object,
    },
    renderItemList: {
        type: Function as PropType<(itemVNodes: VNode[]) => VNode[]>,
    },
    ...COMMON_PROPS,
} as const;

export const ItemProps = {
    index: {
        type: Number,
    },
    horizontal: {
        type: Boolean,
    },
    source: {
        type: [Object, String, Number] as PropType<DataSource>,
    },
    uniqueKey: {
        type: [String, Number] as PropType<string | number>,
    },
    observeResize: {
        type: Boolean,
        default: true,
    },
} as const;
