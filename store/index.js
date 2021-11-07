const state = () => ({
  _loadingDialogShow: false,
  _alertDialog: {
    show: false,
    data: {}
  }
})

const getters = {
  loadingDialogShow: (state) => state._loadingDialogShow,
  alertDialog: (state) => state._alertDialog,
}

const actions = {}

const mutations = {
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
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}