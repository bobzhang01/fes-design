import {
    ref,
    computed,
    defineComponent,
    onMounted,
    onBeforeUnmount,
    getCurrentInstance,
    watch,
} from 'vue';
import getPrefixCls from '../_util/getPrefixCls';
import FadeInExpandTransition from '../_util/components/fadeInExpandTransition';
import Popper from '../popper/popper';
import DownOutlined from '../icon/DownOutlined';
import RightOutlined from '../icon/RightOutlined';
import Ellipsis from '../ellipsis/ellipsis';
import { COMPONENT_NAME } from './const';
import useMenu from './useMenu';
import useChildren from './useChildren';

const prefixCls = getPrefixCls('sub-menu');
export default defineComponent({
    name: COMPONENT_NAME.SUB_MENU,
    components: {
        Ellipsis,
        FadeInExpandTransition,
    },
    props: {
        value: {
            type: [String, Number],
            default: null,
        },
        label: String,
    },
    setup(props, { slots }) {
        const instance = getCurrentInstance();
        const subMenuRef = ref(null);
        const {
            rootMenu,
            parentMenu,
            paddingStyle,
            isFirstLevel,
            onlyIcon,
            indexPath,
        } = useMenu(instance);
        // 根节点 menu
        if (!rootMenu) {
            return console.warn(
                `[${COMPONENT_NAME.SUB_MENU}] must be a child of ${COMPONENT_NAME.MENU}`,
            );
        }
        // 父级组件，可能为 menu 或者 sub-menu
        if (!parentMenu) {
            console.warn(
                `[${COMPONENT_NAME.SUB_MENU}] must be a child of ${COMPONENT_NAME.MENU} or ${COMPONENT_NAME.SUB_MENU}`,
            );
        }
        const { children } = useChildren();
        const isOpened = ref(false);
        const isActive = computed(() =>
            children.some((child) => child?.isActive),
        );
        const subMenu = {
            uid: instance.uid,
            value: props.value,
            type: 'subMenu',
            children,
            isOpened,
            isActive,
        };
        onMounted(() => {
            parentMenu.addChild(subMenu);
            // 默认展开全部
            if (rootMenu.props.defaultExpandAll) {
                // 这才能触发watch
                rootMenu.openedMenus.value = rootMenu.openedMenus.value.concat(
                    props.value || instance.uid,
                );
            }
        });
        onBeforeUnmount(() => {
            parentMenu.removeChild(subMenu);
        });
        const placement = computed(() => {
            if (rootMenu.props.mode === 'horizontal') {
                return isFirstLevel.value ? 'bottom-start' : 'right-start';
            }
            return 'right-start';
        });
        const classList = computed(() =>
            [prefixCls, isActive.value && 'is-active']
                .filter(Boolean)
                .join(' '),
        );
        const handleClickTrigger = () => {
            isOpened.value = !isOpened.value;
            rootMenu.clickSubMenu(subMenu, indexPath);
        };
        watch(rootMenu.openedMenus, () => {
            if (!rootMenu.renderWithPopper.value) {
                const index = rootMenu.openedMenus.value.indexOf(
                    props.value || instance.uid,
                );
                if (index === -1 && isOpened.value) {
                    isOpened.value = false;
                } else if (index !== -1 && !isOpened.value) {
                    isOpened.value = true;
                }
            }
        });
        const renderTitle = () => {
            return (
                <Ellipsis class={`${prefixCls}-label`}>
                    {slots.label?.() || props.label}
                </Ellipsis>
            );
        };
        const renderIcon = () => {
            if (slots.icon) {
                return <div class={`${prefixCls}-icon`}>{slots.icon()}</div>;
            }
            if (onlyIcon.value) {
                return renderTitle();
            }
            return null;
        };
        const renderArrow = () => {
            if (rootMenu.renderWithPopper.value && !isFirstLevel.value) {
                return (
                    <span class={`${prefixCls}-arrow`}>
                        <RightOutlined />
                    </span>
                );
            }
            return (
                <span
                    class={[
                        `${prefixCls}-arrow`,
                        isOpened.value && 'is-opened',
                    ]}
                >
                    <DownOutlined />
                </span>
            );
        };
        const renderWrapper = (trigger: string) => (
            <div
                class={`${prefixCls}-wrapper`}
                style={paddingStyle.value}
                onClick={() => {
                    trigger === 'click' && handleClickTrigger();
                }}
            >
                {renderIcon()}
                {!onlyIcon.value ? renderTitle() : null}
                {!onlyIcon.value ? renderArrow() : null}
            </div>
        );
        const renderDefault = () => slots.default?.();
        const renderContent = () => {
            if (rootMenu.renderWithPopper.value) {
                return (
                    <Popper
                        v-model={isOpened.value}
                        trigger="hover"
                        placement={placement.value}
                        popperClass={`${prefixCls}-popper`}
                        appendToContainer={false}
                        offset={1}
                        v-slots={{
                            default: renderDefault,
                            trigger: renderWrapper,
                        }}
                    />
                );
            }
            return (
                <>
                    {renderWrapper('click')}
                    <FadeInExpandTransition>
                        <div
                            v-show={isOpened.value}
                            class={`${prefixCls}-children`}
                        >
                            {renderDefault()}
                        </div>
                    </FadeInExpandTransition>
                </>
            );
        };
        return () => (
            <div class={classList.value} ref={subMenuRef}>
                {renderContent()}
            </div>
        );
    },
});
