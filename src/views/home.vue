<template>
  <div class="home">
    <img alt="Vue logo" :src="logo">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>
<script>

import HelloWorld from '@components/HelloWorld.vue'
import logo from '@assets/logo.png'

export default {
  name: 'Home',
    components: {
        HelloWorld
    },
    data () {
        return {
            logo
        }
    }
}
</script>