import { defineComponent, inject, PropType } from 'vue';
import FScrollbar from '../../scrollbar/scrollbar.vue';
import vDrag from '../../draggable/directive';
import { provideKey } from '../const';
import Colgroup from './colgroup';
import Header from './header';
import Tr from './tr';

import type { ColumnInst } from '../column.vue';

export default defineComponent({
    directives: {
        drag: vDrag,
    },
    props: {
        composed: {
            type: Boolean,
            default: false,
        },
        columns: {
            type: Array as PropType<ColumnInst[]>,
            required: true,
        },
    },
    setup(props) {
        const {
            layout,
            prefixCls,
            bodyWrapperRef,
            bodyWrapperClass,
            bodyWrapperStyle,
            bodyStyle,
            rootProps,
            showData,
            getRowKey,
            syncPosition,
            scrollbarRef,
            hasFixedColumn,
            onDragstart,
            onDragend,
            beforeDragend,
        } = inject(provideKey);

        const renderBodyTrList = () =>
            showData.value.map((row: object, rowIndex: number) => (
                <Tr
                    row={row}
                    rowIndex={rowIndex}
                    columns={props.columns}
                    key={(getRowKey({ row }) || rowIndex) as any}
                />
            ));

        const renderBody = () => {
            if (showData.value.length === 0) {
                return (
                    <tbody>
                        <Tr columns={props.columns} />
                    </tbody>
                );
            }
            if (rootProps.draggable) {
                return (
                    <tbody
                        v-drag={[
                            showData.value,
                            { onDragstart, onDragend, beforeDragend },
                        ]}
                    >
                        {renderBodyTrList()}
                    </tbody>
                );
            }
            return <tbody>{renderBodyTrList()}</tbody>;
        };

        const renderTable = () => {
            return (
                <table
                    class={`${prefixCls}-body`}
                    style={[
                        bodyStyle.value,
                        {
                            'table-layout': props.composed
                                ? 'fixed'
                                : rootProps.layout,
                        },
                    ]}
                    cellspacing="0"
                    cellpadding="0"
                >
                    <Colgroup columns={props.columns} />
                    {!props.composed && rootProps.showHeader && <Header />}
                    {renderBody()}
                </table>
            );
        };

        const onScroll = (e: Event) => {
            if (layout.isScrollX.value || layout.isScrollY.value) {
                syncPosition(e);
            }
        };

        return () => {
            if (layout.isScrollX.value || layout.isScrollY.value) {
                return (
                    <FScrollbar
                        ref={(el: any) => {
                            if (el) {
                                scrollbarRef.value = el;
                                bodyWrapperRef.value = el.$el;
                            }
                        }}
                        class={bodyWrapperClass.value}
                        style={bodyWrapperStyle.value}
                        horizontalRatioStyle={{ zIndex: 3 }}
                        verticalRatioStyle={{ zIndex: 3 }}
                        shadowStyle={{ zIndex: 3 }}
                        shadow={{
                            x: hasFixedColumn.value,
                            y: true,
                        }}
                        onScroll={onScroll}
                    >
                        {renderTable()}
                    </FScrollbar>
                );
            }
            return (
                <div
                    ref={(el) => {
                        bodyWrapperRef.value = el;
                    }}
                    class={bodyWrapperClass.value}
                    style={bodyWrapperStyle.value}
                >
                    {renderTable()}
                </div>
            );
        };
    },
});
