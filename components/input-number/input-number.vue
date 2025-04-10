<template>
    <div :class="classes" @dragstart.prevent>
        <InputInner
            :modelValue="displayValue"
            :disabled="disabled"
            :placeholder="placeholder"
            :class="[`${prefixCls}-inner`]"
            :innerIsError="isError"
            @input="handleInput"
            @focus="(event) => $emit('focus', event)"
            @blur="handleBlur"
        >
            <template v-if="$slots.prefix" #prefix>
                <slot name="prefix"></slot>
            </template>
            <template #suffix>
                <slot name="suffix"></slot>
                <div
                    :class="[
                        `${prefixCls}-actions`,
                        $slots.suffix && `${prefixCls}-actions-suffix`,
                    ]"
                >
                    <span
                        :class="[
                            `${prefixCls}-actions-increase`,
                            { 'is-disabled': maxDisabled || disabled },
                        ]"
                        @mousedown.prevent
                        @click="calculationNum(ActionEnum.PLUS)"
                    >
                        <UpOutlined />
                    </span>
                    <span
                        :class="[
                            `${prefixCls}-actions-decrease`,
                            { 'is-disabled': minDisabled || disabled },
                        ]"
                        @mousedown.prevent
                        @click="calculationNum(ActionEnum.REDUCE)"
                    >
                        <DownOutlined />
                    </span>
                </div>
            </template>
        </InputInner>
    </div>
</template>

<script lang="ts">
import { computed, provide, ref, nextTick, defineComponent } from 'vue';
import { isNumber } from 'lodash-es';

import { UpOutlined, DownOutlined } from '../icon';
import { useTheme } from '../_theme/useTheme';
import getPrefixCls from '../_util/getPrefixCls';
import { useNormalModel } from '../_util/use/useModel';
import useFormAdaptor from '../_util/use/useFormAdaptor';
import InputInner from '../input/inputInner.vue';
import { FORM_ITEM_INJECTION_KEY } from '../_util/constants';
import { noop } from '../_util/utils';

const prefixCls = getPrefixCls('input-number');

enum ActionEnum {
    PLUS,
    REDUCE,
}

export default defineComponent({
    name: 'FInputNumber',
    components: {
        InputInner,
        UpOutlined,
        DownOutlined,
    },
    props: {
        modelValue: Number,
        min: {
            type: Number,
            default: -Infinity,
        },
        max: {
            type: Number,
            default: Infinity,
        },
        step: {
            type: Number,
            default: 1,
        },
        precision: Number,
        disabled: Boolean,
        placeholder: String,
    },
    emits: ['update:modelValue', 'change', 'input', 'blur', 'focus'],
    setup(props, { emit }) {
        useTheme();
        const { validate, isError } = useFormAdaptor('number');

        // 避免子组件重复
        provide(FORM_ITEM_INJECTION_KEY, { validate: noop, isError });

        const [currentValue, updateCurrentValue] = useNormalModel(props, emit);

        const classes = computed(() =>
            [`${prefixCls}`, props.disabled && 'is-disabled'].filter(Boolean),
        );

        const tempValue = ref();
        const displayValue = computed(() => {
            if (tempValue.value != null) return tempValue.value;
            return currentValue.value;
        });

        // 获取输入值的小数位数
        const getPrecison = (val: number) => {
            if (val == null) return 0;
            const valueString = val.toString();
            const dotPosition = valueString.indexOf('.');
            let valuePrecison = 0;
            if (dotPosition !== -1) {
                valuePrecison = valueString.length - dotPosition - 1;
            }
            return valuePrecison;
        };

        // 数字的实际精度 （组件绑定的精度属性要处理）
        const numPresicion = computed(() => {
            const stepPrecision = getPrecison(props.step);
            if (props.precision != null) {
                const positiveIntegerPresicion = Math.abs(
                    Math.round(props.precision),
                );
                if (stepPrecision > positiveIntegerPresicion) {
                    console.warn(
                        '[InputNumber]precision should not be less than the decimal places of step',
                    );
                }
                return positiveIntegerPresicion;
            }
            return Math.max(getPrecison(currentValue.value), stepPrecision); // 计算时可能currentvalue 无值
        });

        // 保留指定的小数位数
        const toPrecision = (num: number, pre?: number): number => {
            if (pre == null) pre = numPresicion.value;
            return Math.round(num * 10 ** pre) / 10 ** pre;
        };

        const setCurrentValue = (newVal: number) => {
            const oldVal = currentValue.value;
            if (isNumber(newVal) && props.precision != null) {
                newVal = toPrecision(newVal, props.precision);
            }
            if (newVal != null && newVal >= props.max) newVal = props.max;
            if (newVal != null && newVal <= props.min) newVal = props.min;
            if (oldVal === newVal) return;

            tempValue.value = null;
            updateCurrentValue(newVal);
            emit('input', newVal);
            emit('change', newVal, oldVal);
            validate('input');
            validate('change');
        };

        const handleBlur = (e: Event) => {
            if (tempValue.value) tempValue.value = null;
            emit('blur', e);
            validate('blur');
        };

        const handleInput = (value: string) => {
            tempValue.value = value;

            // 在下一个 tick 处理 tempValue，避免无法重制 displayValue
            nextTick(() => {
                if (
                    !value.endsWith('.') &&
                    (!Number.isNaN(Number(value)) || value === '')
                ) {
                    setCurrentValue(value === '' ? null : Number(value));
                }
            });
        };

        const _calculationNum = (val: number, type: ActionEnum) => {
            if (!isNumber(val) && val != null) return tempValue.value;
            const precisionFactor = 10 ** numPresicion.value;
            let tmp;
            if (type === ActionEnum.PLUS) {
                tmp = precisionFactor * val + precisionFactor * props.step;
            } else {
                tmp = precisionFactor * val - precisionFactor * props.step;
            }
            return toPrecision(tmp / precisionFactor);
        };
        // 是否已减小到最小值
        const minDisabled = computed(
            () =>
                _calculationNum(currentValue.value, ActionEnum.REDUCE) <
                props.min,
        );
        // 是否已加到最大值
        const maxDisabled = computed(
            () =>
                _calculationNum(currentValue.value, ActionEnum.PLUS) >
                props.max,
        );

        const calculationNum = (type: ActionEnum) => {
            if (
                props.disabled ||
                (maxDisabled.value && type === ActionEnum.PLUS) ||
                (minDisabled.value && type === ActionEnum.REDUCE)
            )
                return;
            tempValue.value = null;
            setCurrentValue(_calculationNum(currentValue.value || 0, type));
        };

        return {
            prefixCls,
            isError,
            ActionEnum,

            classes,
            handleInput,
            handleBlur,
            calculationNum,
            displayValue,
            minDisabled,
            maxDisabled,
        };
    },
});
</script>
