<template>
  <div id="app">
    <!-- 標題區 -->
    <header class="text-center pt-4 pb-0">
      <h1 class="fw-900">中國暗棋</h1>
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
              <h5 class="fw-900">已開局 <small class="fw-700">（點擊可進入觀戰）</small></h5>
              <div class="online_user_card overflow-auto py-2">
                <b-list-group>
                  <b-list-group-item
                    v-for="(rData, roomKey, ind) in rooms"
                    :key="ind"
                    class="cursor_pointer px-4"
                    @click="intoWatchGame(roomKey)"
                  >
                    <b-row class="flex-nowrap">
                      <b-col cols="auto">#{{ ind+1 }}</b-col>
                      <b-col cols="auto text-truncate">{{ userNameMap[rData.user1] || rData.user1 }}</b-col>
                      <b-col cols="auto"><fa :icon="['fas', 'mitten']" class="dialog-icon" /></b-col>
                      <b-col cols="auto text-truncate">{{ userNameMap[rData.user2] || rData.user2 }}</b-col>
                    </b-row>
                  </b-list-group-item>
                </b-list-group>
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
              href="https://github.com/linziyou0601/chess_games"
              data-size="large"
              aria-label="Star linziyou0601/chess_games on GitHub"
            >
              <fa :icon="['fab', 'github']" /> GitHub
            </a>
            <br/>
            <b-button class="home-btn text-decoration-none mt-2" :to="'/'">回首頁</b-button>
          </div>
        </b-col>
      </b-row>
    </footer>

    <LoadingDialog />
    <AlertDialog />
    <ChineseDarkChessInviteDialog />
    <ChineseDarkChessGameRoomDialog />
    <ChineseDarkChessGameEndDialog />
    <ChineseDarkChessLeaveRoomDialog />
    <ChineseDarkChessSignUpOrSignInDialog />
    <ChineseDarkChessGameRoomWatcherDialog />
    <ChineseDarkChessAskTieDialog />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
const namespace = 'chineseDarkChess'
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
  head() {
    return {
      title: '中國暗棋 | Chinese Dark Chess',
    }
  },
  computed: {
    ...mapGetters(namespace, ['rooms', 'users', 'userNameMap', 'recvMsg']),
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
      channel: `/${namespace}`,
      reconnection: false,
    })
    // 當連線完成時
    this.socket.on("connect", () => { 
      this.socketId = this.socket.id
      this.socket.emit('connected')
    })
    // 當排行更新時
    this.socket.on(`${namespace}/updateRanks`, () => { 
      this.fetchRank()
      this.updateCurrentUser()
    })
    // 讀取排行榜
    this.fetchRank()
  },
  methods: {
    ...mapMutations(['setAlertDialog', 'showLoadingDialog', 'hideLoadingDialog']),
    ...mapMutations(namespace, ['showSignUpOrSignInDialog', 'setAskingTie']),
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
    putChess(params, cb) {
      this.socket.emit('putChess', params, (resp) => { 
        if (resp.status) {
          new Audio('putChess.wav').play()
          cb()
        }
      })
    },
    // 離開房間
    leaveRoom(roomId) {
      this.socket.emit('leaveRoom', roomId)
    },
    // 投降
    surrender(roomId) {
      this.socket.emit('surrender', roomId)
    },
    // 求和
    askTie(roomId) {
      this.socket.emit('askTie', roomId, (resp) => { 
        if (resp.status) {
          this.setAskingTie(true)
          this.showLoadingDialog()
        } else {
          this.hideLoadingDialog()
        }
      })
    },
    // 回應求和
    replyAskTie(params, cb) {
      this.socket.emit('replyAskTie', params, (resp) => {
        if (resp.status) cb()
      })
    },
    // 再一場
    again(roomId) {
      this.socket.emit('again', roomId)
    },

    // 加入觀戰
    intoWatchGame(roomId) {
      this.socket.emit('intoWatchGame', roomId)
    },
    // 離開觀戰
    leaveWatchGame(roomId, cb) {
      this.socket.emit('leaveWatchGame', roomId, (resp) => { 
        if (resp.status) cb()
      })
    },
    // 發送房間訊息
    sendRoomMessage(params) {
      this.socket.emit('sendRoomMessage', params, (resp) => { console.log(resp) })
    },

    // 登入
    signIn() {
      this.showSignUpOrSignInDialog()
    },
    // 執行註冊或登入
    async signUpOrSignIn(name, password, cb) {
      try {
        const result = await this.$axios.$post('/api/ChineseDarkChess/signUpOrSignIn', { name, password })
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
        const users = await this.$axios.$post('/api/ChineseDarkChess/findAll')
        this.ranks = users
      } catch(err) {
        console.log(err)
      }
    },
    // 更新目前玩家資料
    async updateCurrentUser() {
      try {
        const user = await this.$axios.$post('/api/ChineseDarkChess/findByName', { name: this.currentUser.name })
        this.currentUser = user
      } catch(err) {
        console.log(err)
      }
    },
  },
}
</script>

<style scoped>
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
</style>