const state = () => ({
  _rooms: {},
  _users: {},
  _userNameMap: {},
  _recvMsg: '',

  _inviteDialog: {
    show: false,
    inviter: null,
  },
  _gameRoomDialogShow: false,
  _gameRoomData: {},
  _gameEndDialog: {
    show: false,
    winner: '',
    surrendered: false
  },
  _leaveRoomDialogShow: false,

  _signUpOrSignInDialog: {
    show: false,
    name: '',
    password: '',
  },

  _gameRoomWatcherDialogShow: false,
  _recvRoomMsg: '',

  _askingTie: false,
  _askTieDialog: {
    show: false,
    user: null,
  },
})

const getters = {
  rooms: (state) => state._rooms,
  users: (state) => state._users,
  userNameMap: (state) => state._userNameMap,
  recvMsg: (state) => state._recvMsg,

  inviteDialog: (state) => state._inviteDialog,
  gameRoomDialogShow: (state) => state._gameRoomDialogShow,
  gameRoomData: (state) => state._gameRoomData,
  gameEndDialog: (state) => state._gameEndDialog,
  leaveRoomDialogShow: (state) => state._leaveRoomDialogShow,

  signUpOrSignInDialog: (state) => state._signUpOrSignInDialog,

  gameRoomWatcherDialogShow: (state) => state._gameRoomWatcherDialogShow,
  recvRoomMsg: (state) => state._recvRoomMsg,

  askingTie: (state) => state._askingTie,
  askTieDialog: (state) => state._askTieDialog,
}

const actions = {
  // 收到 對戰邀請回應 時
  REPLIED_INVITATION({ commit }) {
    commit('hideLoadingDialog', null, { root: true })
  },
  // 收到 求和回應 時
  REPLIED_ASK_TIE({ commit }) {
    commit('hideLoadingDialog', null, { root: true })
    commit('setAskingTie', false)
    commit('askTieDialogResolved', null)
  },
}

const mutations = {
  // 收到 更新房間清單 時
  UPDATE_ROOMS(state, rooms) {
    state._rooms = rooms
  },
  // 收到 更新使用者清單 時
  UPDATE_USERS(state, users) {
    state._users = users
  },
  // 收到 更新使用者帳號MAP 時
  UPDATE_USER_NAMEMAP(state, userNameMap) {
    state._userNameMap = userNameMap
  },
  // 收到 新訊息 時
  RECEIVE_MESSAGE(state, msg) {
    state._recvMsg += msg + '\n'
  },

  // 收到 對戰邀請 時
  RECEIVE_INVITATION(state, data) {
    state._inviteDialog = { show: true, inviter: data.inviter }
  },

  // 收到 加入房間 時
  INTO_THE_ROOM(state, gameRoomData) {
    state._gameRoomDialogShow = true
    state._gameRoomData = gameRoomData
  },
  // 收到 離開房間 時
  LEAVE_THE_ROOM(state) {
    state._leaveRoomDialogShow = true
    state._gameRoomDialogShow = false
    state._gameRoomWatcherDialogShow = false
    state._gameRoomData = {}
  },
  // 收到 下一回合 時
  NEXT_TURN(state, gameRoomData) {
    state._gameRoomDialogShow = true
    state._gameRoomData = gameRoomData
  },
  // 收到 遊戲結束 時
  GAME_END(state, status) {
    state._gameEndDialog = {
      show: true, 
      winner: status.winner, 
      surrendered: status.surrendered
    }
  },

  // 收到 觀戰新資料 時
  UPDATE_WATCHING_DATA(state, gameRoomData) {
    state._gameRoomWatcherDialogShow = true
    state._gameRoomData = gameRoomData
  },
  // 收到 房間新訊息 時
  RECEIVE_ROOM_MESSAGE(state, msg) {
    state._recvRoomMsg += msg + '\n'
  },

  // 收到 求和請求 時
  RECEIVE_ASK_TIE(state, data) {
    state._askTieDialog = { show: true, user: data.user }
  },
  
  // 結束對戰邀請視窗
  inviteDialogResolved(state) {
    state._inviteDialog = { show: false, inviter: null }
  },
  // 結束遊戲房間視窗
  gameRoomDialogResolved(state) {
    state._gameRoomDialogShow = false
    state._gameRoomData = {}
  },
  // 結束比賽結束視窗
  gameEndDialogResolved(state) {
    state._gameEndDialog.show = false
  },
  // 結束離開房間視窗
  hideLeaveRoomDialog(state) {
    state._leaveRoomDialogShow = false
  },

  // 設定求和中狀態
  setAskingTie(state, val) {
    state._askingTie = val
  },
  // 結束求和視窗
  askTieDialogResolved(state) {
    state._askTieDialog = { show: false, user: null }
  },

  // 註冊或登入視窗
  showSignUpOrSignInDialog(state) {
    state._signUpOrSignInDialog.show = true
  },
  hideSignUpOrSignInDialog(state) {
    state._signUpOrSignInDialog = {
      show: false,
      name: '',
      password: '',
    }
  },

  // 結束觀戰視窗
  hideGameRoomWatcherDialog(state) {
    state._gameRoomWatcherDialogShow = false
    state._gameRoomData = {}
    state._recvRoomMsg = ''
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}