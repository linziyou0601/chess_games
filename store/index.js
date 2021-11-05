const state = () => ({
  _users: {},
  _userNameMap: {},
  _recvMsg: '',
  _loadingDialogShow: false,
  _alertDialog: {
    show: false,
    data: {}
  },
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
  }
})

const getters = {
  users: (state) => state._users,
  userNameMap: (state) => state._userNameMap,
  recvMsg: (state) => state._recvMsg,
  loadingDialogShow: (state) => state._loadingDialogShow,
  alertDialog: (state) => state._alertDialog,
  inviteDialog: (state) => state._inviteDialog,
  gameRoomDialogShow: (state) => state._gameRoomDialogShow,
  gameRoomData: (state) => state._gameRoomData,
  gameEndDialog: (state) => state._gameEndDialog,
  leaveRoomDialogShow: (state) => state._leaveRoomDialogShow,

  signUpOrSignInDialog: (state) => state._signUpOrSignInDialog,
}

const actions = {
}

const mutations = {
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
  // 收到 對戰邀請回應 時
  REPLY_INVITATION(state) {
    state._loadingDialogShow = false
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
    state._gameRoomData = {}
  },
  // 收到 下一回合 時
  NEXT_TURN(state, gameRoomData) {
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
  
  // 顯示稍候視窗
  showLoadingDialog(state) {
    state._loadingDialogShow = true
  },
  // 結束稍候視窗
  hideLoadingDialog(state) {
    state._loadingDialogShow = false
  },
  // 顯示通知視窗
  setAlertDialog(state, data) {
    state._alertDialog = { show: true, data }
  },
  // 顯示結束視窗
  alertDialogResolved(state) {
    state._alertDialog = { show: false, data: {} }
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
  hideLeaveRoomDialogShow(state) {
    state._leaveRoomDialogShow = false
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
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}