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
    <VTLink class="VPNavScreenMenuGroupLink" :href="link" @click="closeScreen">
        {{ text }}
    </VTLink>
</template>

<style scoped>
.VPNavScreenMenuGroupLink {
    display: block;
    line-height: 32px;
    font-size: 13px;
    font-weight: 400;
    color: var(--vt-c-text-1);
    transition: color 0.25s;
    margin-left: 0.6em;
}

.VPNavScreenMenuGroupLink:hover {
    color: var(--vt-c-brand);
}
</style>
