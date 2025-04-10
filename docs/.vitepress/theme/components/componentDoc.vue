<template>
    <div class="component-doc">
        <div class="component-doc-header">
            <span class="play" @click="openPlayground">play</span>
            <LeftOutlined
                :class="['show-code-btn', visibleCode && 'active']"
                @click="visibleCode = !visibleCode"
            />
        </div>
        <div class="component-doc-content">
            <slot></slot>
        </div>
        <div :class="['component-doc-code', visibleCode && 'visible-code']">
            <pre v-html="code"></pre>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';

import playground from './playground';
import { highlight } from './highlight';
import codes from './demoCode';

export default defineComponent({
    props: {
        code: String,
    },
    setup(props) {
        const code = ref('');
        watch(
            () => props.code,
            () => {
                code.value = codes[props.code]
                    ? highlight(codes[props.code], 'vue')
                    : '';
            },
            {
                immediate: true,
            },
        );

        const visibleCode = ref(false);
        const openPlayground = () => {
            playground(props.code);
        };
        return {
            visibleCode,
            // eslint-disable-next-line vue/no-dupe-keys
            code,
            openPlayground,
        };
    },
});
</script>

<style lang="less">
.component-doc {
    border: 1px solid #cfd0d3;
    border-radius: 4px;

    &-header {
        height: 48px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        border-bottom: 1px solid #cfd0d3;
        font-size: 14px;
        padding: 0 16px;
        .show-code-btn {
            cursor: pointer;
            transition: 0.3s all;
            transform-origin: center center;
            &.active {
                transform: rotateZ(-90deg);
            }
        }
        .play {
            margin-right: 20px;
            cursor: pointer;
        }
    }

    &-content {
        padding: 16px;
    }

    &-code {
        max-height: 720px;
        border-top: 1px solid #cfd0d3;
        transition: all 0.3s;
        opacity: 0;
        height: 0;
        font-size: 14px;
        overflow: auto;

        &.visible-code {
            opacity: 1;
            height: auto;
            padding: 16px;
        }
    }
}
</style>
