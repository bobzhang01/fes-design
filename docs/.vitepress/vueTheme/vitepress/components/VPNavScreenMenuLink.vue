<script lang="ts" setup>
import { VTLink } from '../../core';
import { inject } from 'vue';

defineProps<{
    text: string;
    link: string;
}>();

const closeScreen = inject('close-screen') as () => void;
</script>

<template>
    <VTLink class="VPNavScreenMenuLink" :href="link" @click="closeScreen">
        {{ text }}
    </VTLink>
</template>

<style scoped>
.VPNavScreenMenuLink {
    display: block;
    border-bottom: 1px solid var(--vt-c-divider-light);
    padding: 12px 0 11px;
    line-height: 24px;
    font-size: 14px;
    font-weight: 500;
    color: var(--vt-c-text-1);
    transition: border-color 0.5s, color 0.25s;
}

.VPNavScreenMenuLink:hover {
    color: var(--vt-c-brand);
}
</style>
