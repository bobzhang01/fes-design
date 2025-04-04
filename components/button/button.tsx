import { defineComponent, computed, ref, PropType } from 'vue';
import LoadingOutlined from '../icon/LoadingOutlined';
import getPrefixCls from '../_util/getPrefixCls';
import { useAnimate } from '../_util/use/useAnimate';
import { useTheme } from '../_theme/useTheme';

import type { Type, Size } from './interface';

const prefixCls = getPrefixCls('btn');

const loadingIconClassName = `${prefixCls}-loading-icon`;

const buttonProps = {
    disabled: {
        type: Boolean,
        default: false,
    },
    htmlType: {
        type: String as PropType<'button' | 'submit' | 'reset'>,
        default: 'button',
    },
    size: {
        type: String as PropType<Size>,
        default: 'middle',
    },
    loading: {
        type: Boolean,
        default: false,
    },
    long: {
        type: Boolean,
        default: false,
    },
    throttle: {
        type: Number,
        default: 300,
    },
    type: {
        type: String as PropType<Type>,
        default: 'default',
    },
} as const;

export default defineComponent({
    name: 'FButton',
    props: buttonProps,
    emits: ['click'],
    setup(props, { slots, emit }) {
        const { animateClassName, handelAnimate } = useAnimate(400);

        useTheme();
        const notAllowed = ref(false);
        const handleClick = (event: MouseEvent) => {
            if (notAllowed.value || props.disabled || props.loading) return;

            handelAnimate();

            notAllowed.value = true;
            setTimeout(() => {
                notAllowed.value = false;
            }, props.throttle);
            emit('click', event);
        };

        const classes = computed(() => [
            prefixCls,
            animateClassName.value,
            `${prefixCls}-type-${props.type}`,
            props.long && `${prefixCls}-long`,
            props.size !== 'middle' && `${prefixCls}-${props.size}`,
            props.loading && 'is-loading',
        ]);

        return () => (
            <button
                type={props.htmlType}
                disabled={props.disabled}
                class={classes.value}
                onClick={handleClick}
            >
                {props.loading ? (
                    <LoadingOutlined class={loadingIconClassName} />
                ) : (
                    slots.icon?.()
                )}
                {slots.default?.()}
            </button>
        );
    },
});
