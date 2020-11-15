<template>
  <div id="app">
    <div class="body">
      <div class="simulator">
        <div class="goods-wrapper">
          <goods-view></goods-view>
          <load-more></load-more>
        </div>
        <bottom-bar></bottom-bar>
      </div>
    </div>
  </div>
</template>

<script>
import BottomBar from './components/BottomBar.vue';
import GoodsView from './components/GoodsView.vue';
import LoadMore from './components/LoadMore.vue';

export default {
  name: 'App',
  components: {
    GoodsView,
    LoadMore,
    BottomBar,
  },
  created() {
    this.$store.dispatch('init/updateOnline');
    this.$store.dispatch('init/getGoodsList');
  },
};
</script>

<style>
.body {
  width: 100%;
  height: 100%;
}

.simulator {
  padding-top: 15px;
  padding-bottom: 50px;
  width: 375px;
  height: 667px;
  background-color: #fff;
  margin-top: 50px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 20px;
  position: relative;
  border: 1px solid #000;
  box-sizing: border-box;
  display: flex;
}
.goods-wrapper {
  overflow-y: auto;
  flex: 1;
}
</style>
