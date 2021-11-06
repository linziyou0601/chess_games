<template>
  <div id="app">
    <!-- 標題區 -->
    <header class="text-center pt-4 pb-0">
      <h1 class="fw-900">黑白棋</h1>
    </header>

    <!-- 內容區 -->
    <main class="container-fluid mb-3 py-3 py-md-5 px-3 px-sm-5">
      <b-row>
        <b-col cols="12" md="6">
          <b-row>
            <b-col cols="12">
              <h5 class="fw-900">我的資訊</h5>
              <div class="panel p-3">
                <div>Socket ID：{{ socketId }}</div>
                <div v-if="currentUser" class="mt-3">
                  <div>帳號：{{ currentUser.name }}</div>
                  <div>勝：{{ currentUser.win }}</div>
                  <div>敗：{{ currentUser.lose }}</div>
                  <div>平：{{ currentUser.tie }}</div>
                </div>
                <div v-if="!currentUser && socketId!=='未連線'" class="mt-3">
                  <div>帳號：訪客&emsp;&emsp;<b-button class="login-btn" @click="signIn">登入</b-button></div>
                </div>
              </div>
            </b-col>

            <b-col cols="12" class="mt-4">
              <h5 class="fw-900">在線玩家 <small class="fw-700">（點擊玩家可發起邀請）</small></h5>
              <div class="online_user_card overflow-auto py-2">
                <b-list-group>
                  <b-list-group-item
                    v-for="(userSocket, ind) in users"
                    :key="ind"
                    :class="{self_socket_id: socketId===userSocket, cursor_pointer: true, 'px-4': true}"
                    @click="sendInvitation(userSocket)"
                  >
                    {{ (!userNameMap[userSocket])? `訪客 (${userSocket})`: userNameMap[userSocket]}}
                  </b-list-group-item>
                </b-list-group>
              </div>
            </b-col>
          </b-row>
        </b-col>

        <b-col cols="12" md="6">
          <b-row>
            <b-col cols="12" class="mt-4 mt-md-0">
              <h5 class="fw-900">排行榜</h5>
              <div class="rank_card overflow-auto py-2">
                <b-list-group>
                  <b-list-group-item
                    v-for="(user, ind) in ranks"
                    :key="ind"
                    :class="{self_socket_id: currentUser!=null && user.name===currentUser.name, 'px-4': true}"
                  >
                    <b-row>
                      <b-col cols="auto">#{{ ind+1 }}</b-col>
                      <b-col class="text-truncate">{{ user.name }}</b-col>
                      <b-col cols="auto" class="text-right">{{ `${user.win}勝/${user.lose}敗/${user.tie}平` }}</b-col>
                    </b-row>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </b-col>

            <b-col cols="12" class="mt-4">
              <h5 class="fw-900">即時聊天區</h5>
              <div class="panel p-3">
                <b-row align-v="center">
                  <b-col cols="12">
                    <b-form-textarea class="msgBox" :value="recvMsg" rows="8" no-resize readonly />
                  </b-col>
                  <b-col class="mt-3">
                    <b-form-textarea v-model="sendMsg" class="msgBox" type="text" placeholder="請輸入訊息" />
                  </b-col>
                  <b-col cols="auto" class="mt-3">
                    <b-button class="send-btn" @click="sendMessage">
                      <fa :icon="['fas', 'paper-plane']" />
                    </b-button>
                  </b-col>
                </b-row>
              </div>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </main>

    <!-- 頁尾區 -->
    <footer>
      <b-row class="justify-content-center align-content-center pb-5">
        <b-col id="footer-panel" cols="12">
          <div class="card-body text-center">
            Linziyou <a
              class="text-dark text-decoration-none"
              href="https://github.com/linziyou0601/reversi"
              data-size="large"
              aria-label="Star linziyou0601/reversi on GitHub"
            >
              <fa :icon="['fab', 'github']" /> GitHub
            </a>
          </div>
        </b-col>
      </b-row>
    </footer>

    <LoadingDialog />
    <AlertDialog />
    <InviteDialog />
    <GameRoomDialog />
    <GameEndDialog />
    <LeaveRoomDialog />
    <SignUpOrSignInDialog />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  data() {
    return {
      socketStatus: {},
      socketId: '未連線',
      
      currentUser: null,
      ranks: [],
      sendMsg: '',
    }
  },
  computed: {
    ...mapGetters(['users', 'userNameMap', 'recvMsg']),
  },
  watch: {
    socketId(newValue, oldValue) {
      if (newValue!=='未連線') this.hideLoadingDialog()
      else this.showLoadingDialog()
    }
  },
  created() {
    this.showLoadingDialog()
  },
  mounted() {
    // 連線至Socket
    this.socket = this.$nuxtSocket({
      name: 'main',
      reconnection: false,
    })
    // 當連線完成時
    this.socket.on("connect", () => { 
      this.socketId = this.socket.id
      this.socket.emit('connected')
    })
    // 當排行更新時
    this.socket.on("updateRanks", () => { 
      this.fetchRank()
      this.updateCurrentUser()
    })
    // 讀取排行榜
    this.fetchRank()
  },
  methods: {
    ...mapMutations(['setAlertDialog', 'showLoadingDialog', 'hideLoadingDialog', 'showSignUpOrSignInDialog']),
    // 發送訊息
    sendMessage() {
      this.socket.emit('sendMessage', this.sendMsg)
      this.sendMsg = ""
    },
    // 發送邀請
    sendInvitation(user) {
      if (user===this.socketId) 
        this.setAlertDialog({ title: '錯誤', msg: '不能邀請自己！' })
      else
        this.socket.emit('sendInvitation', user, (resp) => { 
          if (resp.status) 
            this.showLoadingDialog()
          else {
            this.hideLoadingDialog()
            this.setAlertDialog({ title: '錯誤', msg: '無法邀請該名使用者' })
          }
        })
    },
    // 回應邀請
    replyInvitation(params, cb) {
      this.socket.emit('replyInvitation', params, (resp) => { 
        if (resp.status) cb()
      })
    },
    // 下棋
    putChess(params) {
      this.socket.emit('putChess', params, (resp) => { 
        if (resp.status) new Audio('putChess.wav').play()
      })
    },
    // 離開房間
    leaveRoom(params) {
      this.socket.emit('leaveRoom', params)
    },
    // 投降
    surrender(params) {
      this.socket.emit('surrender', params)
    },
    // 再一場
    again(params) {
      this.socket.emit('again', params)
    },

    // 登入
    signIn() {
      this.showSignUpOrSignInDialog()
    },
    // 執行註冊或登入
    async signUpOrSignIn(name, password, cb) {
      try {
        const result = await this.$axios.$post('/api/signUpOrSignIn', { name, password })
        if (result.valid) {
          this.currentUser = result.user
          // 暫存user至socket server
          this.socket.emit('recordUserName', this.currentUser.name, (resp) => {
            if (resp.duplicated) {
              this.currentUser = null;
              this.setAlertDialog({ title: '錯誤', msg: '帳號重複登入' })
            }
          })
          cb()
        } else {
          this.setAlertDialog({ title: '錯誤', msg: '密碼錯誤' })
        }
      } catch(err) {
        console.log(err)
      }
    },
    // 取得所有玩家資料
    async fetchRank() {
      try {
        const users = await this.$axios.$post('/api/findAll')
        this.ranks = users
      } catch(err) {
        console.log(err)
      }
    },
    // 更新目前玩家資料
    async updateCurrentUser() {
      try {
        const user = await this.$axios.$post('/api/findByName', { name: this.currentUser.name })
        this.currentUser = user
      } catch(err) {
        console.log(err)
      }
    },
  },
}
</script>

<style>
@font-face {
  font-family: SweiGothicCJKtc;
  src: url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Regular.woff2)
      format('woff2'),
    url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Regular.woff)
      format('woff');
  font-weight: 400;
}
@font-face {
  font-family: SweiGothicCJKtc;
  src: url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Medium.woff2)
      format('woff2'),
    url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Medium.woff)
      format('woff');
  font-weight: 500;
}
@font-face {
  font-family: SweiGothicCJKtc;
  src: url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Bold.woff2)
      format('woff2'),
    url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Bold.woff)
      format('woff');
  font-weight: 700;
}
@font-face {
  font-family: SweiGothicCJKtc;
  src: url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Black.woff2)
      format('woff2'),
    url(https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.129/WebFont/CJK%20TC/SweiGothicCJKtc-Black.woff)
      format('woff');
  font-weight: 900;
}
.fw-900 { font-weight: 900 !important; }
.fw-700 { font-weight: 700 !important; }
.fw-500 { font-weight: 500 !important; }
.fw-400 { font-weight: 400 !important; }
.fw-300 { font-weight: 300 !important; }
.fw-200 { font-weight: 200 !important; }
.fw-100 { font-weight: 100 !important; }

/* -------------------- 字型 -------------------- */
html,
body {
  overflow-x: hidden;
  font-family: 'SweiGothicCJKtc', Helvetica, 'PingFang TC', '微軟正黑體',
    'Microsoft JhengHei', sans-serif !important;
  font-weight: 700;
  padding-right:0px !important;
  margin-right:0px !important;
  color: #333;
  background: #fffef9;
}

main {
  min-height: calc(100vh - 210px);
}

.panel {
  font-size: 16px;
  font-weight: 500;
  border-radius: 10px;
  background: #ebe5de;
}
.msgBox {
  border-radius: 10px;
  background: #dad3c9 !important;
  font-weight: 700;
  color: #333 !important;
  border: none;
}
.send-btn {
  background: #3d3a33;
  border: none;
}

.rank_card {
  max-height: 300px;
  border-radius: 10px;
  background: #ebe5de;
  border: none;
}
.rank_card .list-group-item{
  background: transparent;
  border: none;
  border-bottom: #d3ccc2 solid 1px;
}
.online_user_card {
  max-height: 50vh;
  border-radius: 10px;
  background: #ebe5de;
  border: none;
}
.online_user_card .list-group-item{
  background: transparent;
  border: none;
  border-bottom: #d3ccc2 solid 1px;
}

.self_socket_id {
  font-weight: 700;
  color: #bd520a;
}
.cursor_pointer {
  cursor: pointer;
}
.login-btn {
  background: #3d3a33;
  border: none;
}
</style>