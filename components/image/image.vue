<template>
    <div ref="container" :class="prefixCls">
        <slot v-if="loading" name="placeholder">
            <div :class="`${prefixCls}__placeholder`">
                <PictureOutlined />
                <span>加载中</span>
            </div>
        </slot>

        <slot v-else-if="isLoadError" name="error">
            <div :class="`${prefixCls}__error`">
                <PictureFailOutlined />
                <span>加载失败</span>
            </div>
        </slot>

        <div v-else :class="`${prefixCls}__inner`" @click="clickHandler">
            <slot>
                <img
                    :src="src"
                    :class="`${prefixCls}__inner-image`"
                    :style="imageStyle"
                    v-bind="imgCommonProps"
                />
            </slot>
        </div>

        <template v-if="isShowPreview">
            <preview
                :src="src"
                :name="name"
                :size="imageSize"
                :download="download"
                :hide-on-click-modal="hideOnClickModal"
                @close="closeViewer"
            >
            </preview>
        </template>
    </div>
</template>
<script lang="ts">
import {
    computed,
    watch,
    ref,
    nextTick,
    inject,
    ImgHTMLAttributes,
    defineComponent,
    PropType,
    onUnmounted,
    reactive,
} from 'vue';
import { useEventListener, useThrottleFn } from '@vueuse/core';
import { isString } from 'lodash-es';
import getPrefixCls from '../_util/getPrefixCls';
import { PictureOutlined, PictureFailOutlined } from '../icon';
import { isHtmlElement, getScrollContainer, isInContainer } from '../_util/dom';
import { noop, noopInNoop } from '../_util/utils';
import { CLOSE_EVENT, LOAD_EVENT, ERROR_EVENT } from '../_util/constants';
import download from '../_util/download';
import { useTheme } from '../_theme/useTheme';
import { PREVIEW_PROVIDE_KEY } from './props';
import Preview from './preview.vue';

import type { CSSProperties } from 'vue';

const prefixCls = getPrefixCls('img');

let curIndex = 0;
let prevOverflow = '';

export default defineComponent({
    name: 'FImage',
    componentName: 'FImage',
    components: {
        Preview,
        PictureOutlined,
        PictureFailOutlined,
    },
    props: {
        src: {
            type: String,
            default: '',
        },
        name: String,
        preview: {
            type: Boolean,
            default: false,
        },
        fit: {
            type: String as PropType<
                'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
            >,
        },
        lazy: {
            type: Boolean,
            default: false,
        },
        hideOnClickModal: {
            type: Boolean,
            default: false,
        },
        scrollContainer: [String, Object] as PropType<string | HTMLElement>,
        download: {
            type: Boolean,
            default: false,
        },
    },
    emits: [ERROR_EVENT, LOAD_EVENT, CLOSE_EVENT],
    setup(props, { attrs, emit }) {
        useTheme();
        const loading = ref(true);
        const isLoadError = ref(false);
        const container = ref(null);
        const isShowPreview = ref(false);
        const currentId = ref(curIndex++);

        const {
            width = '',
            height = '',
            crossorigin = '',
            decoding = 'auto',
            alt = '',
            sizes = '',
            srcset = '',
            usemap = '',
        } = attrs as ImgHTMLAttributes;

        const imgCommonProps = {
            crossorigin,
            decoding,
            alt,
            sizes,
            srcset,
            usemap,
        };

        const imageSize = reactive({
            height: 0,
            width: 0,
        });

        const { isGroup, setShowPreview, setCurrent, registerImage } = inject(
            PREVIEW_PROVIDE_KEY,
            {
                setShowPreview: noop,
                isGroup: ref(false),
                setCurrent: noop,
                registerImage: noopInNoop,
            },
        );

        const canPreview = computed(() => props.preview && !isLoadError.value);

        const canGroupPreview = computed(
            () => isGroup.value && !isLoadError.value,
        );

        const _scrollContainer = computed(() => {
            let dom: any;
            const _container = props.scrollContainer;
            if (isString(_container) && _container !== '') {
                dom = document.querySelector(_container);
            }
            if (isHtmlElement(_container)) {
                dom = _container;
            } else if (container) {
                dom = getScrollContainer(container.value);
            }
            return dom;
        });

        const imageStyle = computed<CSSProperties>(() => {
            const { fit } = props;
            const styleObj: CSSProperties = { objectFit: 'fill', cursor: '' };
            if (fit) {
                styleObj.objectFit = fit;
            }
            if (props.download || canPreview.value || canGroupPreview.value) {
                styleObj.cursor = 'pointer';
            }
            return styleObj;
        });

        const handleLoaded = (e: Event, img: HTMLImageElement) => {
            imageSize.width = img.width;
            imageSize.height = img.height;
            loading.value = false;
            isLoadError.value = false;
            emit(LOAD_EVENT, e);
        };

        const handleError = (e: Event) => {
            loading.value = false;
            isLoadError.value = true;
            emit(ERROR_EVENT, e);
        };

        const loadImage = () => {
            if (!loading.value) return;

            const img = new Image();
            img.addEventListener('load', (e) => handleLoaded(e, img));
            img.addEventListener('error', handleError);

            img.src = props.src;
        };

        const lazyLoadHandler = useThrottleFn(() => {
            // load image until image enter the container
            if (isInContainer(container.value, _scrollContainer.value)) {
                loadImage();
            }
        }, 200);

        let clearScrollListener = noop;
        async function addLazyLoadListener() {
            await nextTick();
            clearScrollListener && clearScrollListener();

            if (_scrollContainer.value) {
                clearScrollListener = useEventListener(
                    _scrollContainer,
                    'scroll',
                    lazyLoadHandler,
                );
            }
            lazyLoadHandler();
        }

        function clickHandler() {
            if (canGroupPreview.value) {
                setCurrent(currentId.value);
                setShowPreview(true);
            } else if (canPreview.value) {
                // prevent body scroll
                prevOverflow = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
                isShowPreview.value = true;
            } else if (props.download) {
                // 下载
                download({
                    href: props.src,
                    name: props.name,
                });
            }
        }

        function closeViewer() {
            document.body.style.overflow = prevOverflow;
            isShowPreview.value = false;
            emit(CLOSE_EVENT);
        }

        watch(
            () => props.src,
            (_src) => {
                if (_src) {
                    if (props.lazy) {
                        addLazyLoadListener();
                    } else {
                        loadImage();
                    }
                }
            },
            { immediate: true },
        );

        let unRegister = noop;
        watch(
            [() => props.src, canGroupPreview],
            () => {
                unRegister();
                if (canGroupPreview.value) {
                    unRegister = registerImage({
                        id: currentId.value,
                        url: props.src,
                        name: props.name,
                        size: imageSize,
                        download: props.download,
                    });
                }
            },
            { immediate: true },
        );

        onUnmounted(() => {
            unRegister && unRegister();
            clearScrollListener && clearScrollListener();
        });

        return {
            width,
            height,
            imgCommonProps,
            imageStyle,
            isShowPreview,
            clickHandler,
            closeViewer,
            container,
            prefixCls,
            isLoadError,
            loading,
            imageSize,
        };
    },
});
</script>
