<template>
  <div>
    <!-- Modal主題 -->
    <b-modal
      v-model="show"
      hide-header
      hide-footer
      centered
    >
    <b-row>
      <b-col class="text-center py-5">
        <div>
          <fa :icon="['fas', 'user-circle']" class="dialog-icon mb-4" />
        </div>
        <h4 class="mt-2 mb-3 fw-900">登入</h4>
        <div class="mt-2 mb-3 mx-4">
          <b-input v-model="inputName" type="username" name="username" placeholder="帳號" />
        </div>
        <div class="mt-2 mb-3 mx-4">
          <b-input v-model="inputPassword" type="password" name="password" placeholder="密碼" />
        </div>
        <b-button variant="dark" class="mt-3" @click="ok()">註冊或登入</b-button>
        </b-col>
      </b-row>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
const namespace = 'reversi'
export default {data() {
    return {
      inputName: '',
      inputPassword: '',
    }
  },
  computed: {
    ...mapGetters(namespace, ['signUpOrSignInDialog']),
    show: {
      get() {
        return this.signUpOrSignInDialog.show
      },
      set(_) {
        this.hideSignUpOrSignInDialog()
      },
    },
  },
  methods: {
    ...mapMutations(namespace, ['hideSignUpOrSignInDialog']),
    ok() {
      this.$parent.signUpOrSignIn(this.inputName, this.inputPassword, this.hideSignUpOrSignInDialog)
    },
  },
}
</script>

<style scoped>
>>> .modal-content, >>> .modal-body {
  border-radius: 1rem;
  border: none;
  box-shadow: 1px 1px 20px #666666A6;
  -webkit-box-shadow: 1px 1px 20px #666666A6;
	-moz-box-shadow: 1px 1px 20px #666666A6;
}

/* -------------------- 資料物件 -------------------- */
.dialog-icon {
  font-size: 70px;
  font-weight: 700;
}

input {
  border-radius: 15px;
}
</style>