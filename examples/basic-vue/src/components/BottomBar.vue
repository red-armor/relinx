<template>
  <div>
    <div class="wrapper">
      <span class="text">
        number {{count}}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomBar',
  computed:{
    count(){
      return this.$store.state.bottomBar.count;
    }
  }
};
</script>

<style scoped>
.wrapper {
  right: 0;
  bottom: 0;
  left: 0;
  height: 50px;
  position: absolute;
  background-color: #fff;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  border-top: 1px solid #eee;
}
.text {
  font-size: 16px;
  line-height: 20px;
  margin-top: 15px;
  padding-left: 15px;
  color: rgb(230, 48, 48);
  position: relative;
  display: block;
}
</style>