export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: '棋類遊戲 | Chess Game',
    htmlAttrs: {
      lang: 'zh-tw'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '棋類對戰小遊戲' },
      { name: 'format-detection', content: 'telephone=no' },
      { hid: 'og:type', name: 'og:type', content: 'website' },
      { hid: 'og:title', name: 'og:title', content: '棋類遊戲 | Chess Game' },
      { hid: 'og:title', name: 'og:title', content: '棋類對戰小遊戲' },
      { hid: 'og:site_name', name: 'og:site_name', content: '棋類遊戲 | Chess Game' },
      { hid: 'keywords', name: 'keywords', content: '棋類遊戲,下棋,黑白棋,象棋,暗棋,reversi,chinese dark chess,chess,遊戲' },
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
  axios: { baseURL: process.env.BASE_URL || 'http://localhost:3000' },

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
        actions: [
        // REVERSI  
        {
          'reversi/repliedInvitation': 'reversi/REPLIED_INVITATION',
        },
        // CHINESE DARK CHESS
        {
          'chineseDarkChess/repliedInvitation': 'chineseDarkChess/REPLIED_INVITATION',
        },{
          'chineseDarkChess/repliedAskTie': 'chineseDarkChess/REPLIED_ASK_TIE',
        }],
        mutations: [
        // REVERSI
        {
          'reversi/updateRooms': 'reversi/UPDATE_ROOMS',
        }, {
          'reversi/updateUesrs': 'reversi/UPDATE_USERS',
        }, {
          'reversi/updateUserNameMap': 'reversi/UPDATE_USER_NAMEMAP'
        },{
          'reversi/receiveMessage': 'reversi/RECEIVE_MESSAGE',
        }, {
          'reversi/receiveInvitation': 'reversi/RECEIVE_INVITATION',
        }, {
          'reversi/intoTheRoom': 'reversi/INTO_THE_ROOM'
        }, {
          'reversi/nextTurn': 'reversi/NEXT_TURN'
        }, {
          'reversi/leaveTheRoom': 'reversi/LEAVE_THE_ROOM'
        }, {
          'reversi/gameEnd': 'reversi/GAME_END'
        }, {
          'reversi/updateWatchingData': 'reversi/UPDATE_WATCHING_DATA'
        }, {
          'reversi/receiveRoomMessage': 'reversi/RECEIVE_ROOM_MESSAGE',
        },
        // CHINESE DARK CHESS
        {
          'chineseDarkChess/updateRooms': 'chineseDarkChess/UPDATE_ROOMS',
        }, {
          'chineseDarkChess/updateUesrs': 'chineseDarkChess/UPDATE_USERS',
        }, {
          'chineseDarkChess/updateUserNameMap': 'chineseDarkChess/UPDATE_USER_NAMEMAP'
        },{
          'chineseDarkChess/receiveMessage': 'chineseDarkChess/RECEIVE_MESSAGE',
        }, {
          'chineseDarkChess/receiveInvitation': 'chineseDarkChess/RECEIVE_INVITATION',
        }, {
          'chineseDarkChess/receiveAskTie': 'chineseDarkChess/RECEIVE_ASK_TIE',
        }, {
          'chineseDarkChess/intoTheRoom': 'chineseDarkChess/INTO_THE_ROOM'
        }, {
          'chineseDarkChess/nextTurn': 'chineseDarkChess/NEXT_TURN'
        }, {
          'chineseDarkChess/leaveTheRoom': 'chineseDarkChess/LEAVE_THE_ROOM'
        }, {
          'chineseDarkChess/gameEnd': 'chineseDarkChess/GAME_END'
        }, {
          'chineseDarkChess/updateWatchingData': 'chineseDarkChess/UPDATE_WATCHING_DATA'
        }, {
          'chineseDarkChess/receiveRoomMessage': 'chineseDarkChess/RECEIVE_ROOM_MESSAGE',
        }],
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
