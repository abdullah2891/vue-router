import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Home = { template: '<div>home</div>' }
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

/**
 * Signatre of all route guards:
 * @param {Route} route
 * @param {Function} redirect - redirect to another route
 * @param {Function} next - confirm the route
 */
function guardRoute (route, redirect, next) {
  if (window.confirm(`Navigate to ${route.path}?`)) {
    next()
  } else if (window.confirm(`Redirect to /baz?`)) {
    redirect('/baz')
  }
}

// Baz implements an in-component beforeRouteLeave hook
const Baz = {
  data () {
    return { saved: false }
  },
  template: `
    <div>
      <p>baz ({{ saved ? 'saved' : 'not saved' }})<p>
      <button @click="saved = true">save</button>
    </div>
  `,
  beforeRouteLeave (route, redirect, next) {
    if (this.saved || window.confirm('Not saved, are you sure you want to navigate away?')) {
      next()
    }
  }
}

// Baz implements an in-component beforeRouteEnter hook
const Qux = {
  data () {
    return {
      msg: null
    }
  },
  template: `<div>{{ msg }}</div>`,
  beforeRouteEnter (route, redirect, next) {
    // Note that enter hooks do not have access to `this`
    // because it is called before the component is even created.
    // However, we can provide a callback to `next` which will
    // receive the vm instance when the route has been confirmed.
    //
    // simulate an async data fetch.
    // this pattern is useful when you want to stay at current route
    // and only switch after the data has been fetched.
    setTimeout(() => {
      next(vm => {
        vm.msg = 'Qux'
      })
    }, 300)
  }
}

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', component: Home },

    // inline guard
    { path: '/foo', component: Foo, beforeEnter: guardRoute },

    // using meta properties on the route config
    // and check them in a global before hook
    { path: '/bar', component: Bar, meta: { needGuard: true }},

    // Baz implements an in-component beforeRouteLeave hook
    { path: '/baz', component: Baz },

    // Qux implements an in-component beforeRouteEnter hook
    { path: '/qux', component: Qux }
  ]
})

router.beforeEach((route, redirect, next) => {
  if (route.matched.some(m => m.meta.needGuard)) {
    guardRoute(route, redirect, next)
  } else {
    next()
  }
})

new Vue({
  router,
  template: `
    <div id="app">
      <h1>Navigation Guards</h1>
      <ul>
        <li><router-link to="/">/</router-link></li>
        <li><router-link to="/foo">/foo</router-link></li>
        <li><router-link to="/bar">/bar</router-link></li>
        <li><router-link to="/baz">/baz</router-link></li>
        <li><router-link to="/qux">/qux</router-link></li>
      </ul>
      <router-view class="view"></router-view>
    </div>
  `
}).$mount('#app')