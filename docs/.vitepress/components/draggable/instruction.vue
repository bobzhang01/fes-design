<template>
    <div class="container">
        <div v-drag:[dragArg]="vlist">
            <div
                v-for="i in vlist"
                :key="i"
                class="sort-item"
                style="opacity: 1"
            >
                <span>{{ i }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
export default {
    setup() {
        const vlist = ref([]);
        setTimeout(() => {
            vlist.value = [1, 2, 3, 4, 5];
        }, 1000);

        const dragArg = {
            onDragstart(event, item, setting) {
                console.log('handleDargStart', event, item, setting);
            },
            onDragend(event, item, setting) {
                console.log('handleDargEnd', event, item, setting);
            },
            beforeDragend(item, start, end) {
                console.log('beforeDragend', item, start, end);
                return true;
            },
        };

        return {
            vlist,
            dragArg,
        };
    },
};
</script>

<style scoped>
.container {
    background: #eee;
    padding: 50px 20px;
}
.sort-item {
    line-height: 50px;
    background: #fff;
    margin: 1px 0;
    padding-left: 20px;
}
</style>
