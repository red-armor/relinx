<template>
  <div class="container">
    <span class="title">{{title}}</span>

    <span class="span-style">
      (item update {{current}})
    </span>

    <div class="counter">
      <button
        class="addon"
        @click="increment"
      >+</button>
      <span class="item-count">{{count}}</span>
      <button
        class="addon"
        @click="decrement"
      >-</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoodsItem',
  props: {
    id: {
      type: Number,
      default: -1,
    },
    index: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      current: 0,
    };
  },
  computed:{
    title(){
      return this.$store.state.goods.listData[this.index].title
    },
    count(){
      return this.$store.state.goods.listData[this.index].count
    }
  },
  methods: {
    increment() {
      this.$store.dispatch('goods/increment', {
        id: this.id,
        index: this.index,
      });
    },
    decrement() {
      this.$store.dispatch('goods/decrement', {
        id: this.id,
        index: this.index,
      });
    },
  },
};
</script>

<style scoped>
.container {
  height: 50px;
  padding: 15px;
  box-sizing: border-box;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: relative;
}
.title {
  font-size: 16px;
  line-height: 20px;
  color: rgb(23, 171, 37);
}
.counter {
  position: absolute;
  right: 0;
  top: 0;
  width: 90px;
  bottom: 0;
}
.addon {
  font-size: 16px;
  line-height: 20px;
  background-color: #fff;
  border-radius: 15px;
  margin-top: 10px;
  outline: 0;
}
.item-count {
  margin-left: 5px;
  margin-right: 5px;
  font-size: 16px;
  width: 15px;
  display: inline-block;
  text-align: center;
}
.span-style {
  color: grey;
  margin-left: 20px;
}
</style>