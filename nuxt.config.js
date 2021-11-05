export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: '黑白棋 | reversi',
    htmlAttrs: {
      lang: 'zh-tw'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '黑白棋對戰小遊戲' },
      { name: 'format-detection', content: 'telephone=no' },
      { hid: 'og:type', name: 'og:type', content: 'website' },
      { hid: 'og:title', name: 'og:title', content: '黑白棋 | reversi' },
      { hid: 'og:title', name: 'og:title', content: '黑白棋對戰小遊戲' },
      { hid: 'og:site_name', name: 'og:site_name', content: '黑白棋 | reversi' },
      { hid: 'keywords', name: 'keywords', content: '黑白棋,reversi,遊戲' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [{
    src: '~/plugins/font-awesome'
  }],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',

    'nuxt-fontawesome',
    'nuxt-socket-io',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  fontawesome: {
    // icon 的標籤使用 <fa>，這邊不設定就會依照 plugin 裡的設定<font-awesome-icon>
    component: 'fa', 
    imports: [
      {
        set: '@fortawesome/free-solid-svg-icons',
        icons: ['fas']
      },
      {
        set: '@fortawesome/free-regular-svg-icons',
        icons: ['far']
      },
      {
        set: '@fortawesome/free-brands-svg-icons',
        icons: ['fab']
      },
    ]
  },

  io: {
    // module options
    sockets: [{
      name: 'main',
      // url: 'http://localhost:3000',
      default: true,
      vuex: {
        mutations: [{
          updateUesrs: 'UPDATE_USERS',
        }, {
          updateUserNameMap: 'UPDATE_USER_NAMEMAP'
        },{
          receiveMessage: 'RECEIVE_MESSAGE',
        }, {
          receiveInvitation: 'RECEIVE_INVITATION',
        }, {
          replyInvitation: 'REPLY_INVITATION',
        }, {
          intoTheRoom: 'INTO_THE_ROOM'
        }, {
          nextTurn: 'NEXT_TURN'
        }, {
          leaveTheRoom: 'LEAVE_THE_ROOM'
        }, {
          gameEnd: 'GAME_END'
        }]
      }
    }]
  },

  serverMiddleware: [
    // API middleware
    '~/server/index.js'
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
