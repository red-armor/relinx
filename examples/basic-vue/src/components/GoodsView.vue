<template>
  <div>
    <span class="span-style">view update {{current}}, length {{listLength}}</span>
    <goods-item
      v-for="(item) in listData"
      :key="item.id"
      :item="item"
    ></goods-item>
  </div>
</template>

<script>
import GoodsItem from './GoodsItem';
export default {
  name: 'GoodsView',
  components: {
    GoodsItem,
  },
  data() {
    return {
      current: 0,
    };
  },
  computed: {
    listData() {
      return this.$store.state.goods.listData;
    },
    listLength() {
      return this.$store.state.goods.listLength;
    },
  },
  beforeUpdate() {
    this.current +=1
  },
};
</script>

<style scoped>
.span-style {
  position: absolute;
  top: 0;
  left: 20px;
  color: red;
}
</style>