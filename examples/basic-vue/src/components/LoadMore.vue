<template>
  <div
    class="wrapper"
    @click="handleClick"
  >
    获取更多
  </div>
</template>

<script>
export default {
  name: 'LoadMore',
  methods:{
    handleClick(){
      this.$store.dispatch('init/getGoodsList')
    }
  }
};
</script>

<style scoped>
.wrapper {
  width: 100%;
  height: 50px;
  text-align: center;
  font-size: 16px;
  line-height: 50px;
  background-color: #5cbd3c;
}
</style>