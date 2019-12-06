<template>
  <div class="container">
    <nuxt-link to="/">ローカル側で対応</nuxt-link>
    <v-card class="ma-2">
      <v-card-title>Storageで行う版</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="4">
            <v-img
              :src="previewImageSrc"
              aspect-ratio="1"
              class="previewImg"
            ></v-img>
          </v-col>
          <v-col cols="8" align-self="center">
            <v-file-input
              @change="onChangeFileInput"
              label="画像の変更"
            ></v-file-input>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="execute">送信</v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="ma-2">
      <v-card-text>
        <v-card-actions>
          <v-btn @click="loadStorageImage">UP画像をロードする(For変換処理待ち)</v-btn>
        </v-card-actions>

        <v-row>
          <v-col>
            <p>Upされた画像</p>
            <v-img
              :src="downloadImageSrc"
              aspect-ratio="1"
              class="downloadImg"
            ></v-img>
          </v-col>
          <v-col>
            <p>Upされて変換された画像</p>
            <v-img
              :src="convertedImageSrc"
              aspect-ratio="1"
              class="convertedImg"
            ></v-img>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FirebaseManager from '~/libs/FirebaseManager'
import UtilDate from '~/libs/UtilDate'

@Component
export default class IndexPage extends Vue {
  inputFileReader: FileReader
  previewImageSrc: string | ArrayBuffer | null = ''
  imageFile: File | null
  downloadImageSrc: string = ''
  convertedImageSrc: string = ''
  savePath: string = ''
  convertPath: string = ''
  fbMng: FirebaseManager

  beforeCreate() {
    this.fbMng = new FirebaseManager()
    this.inputFileReader = new FileReader()
    this.inputFileReader.addEventListener(
      'load',
      () => {
        this.previewImageSrc = this.inputFileReader.result
      },
      false
    )
  }
  mounted() {
    this.fbMng.authorize()
  }
  execute() {
    const fileName = UtilDate.format(new Date(), 'Ymd_His')
    this.savePath = 'images/' + fileName
    this.convertPath = 'images/cv_' + fileName
    if (this.imageFile) {
      this.fbMng.uploadFile(this.savePath, this.imageFile).then(() => {
        this.loadStorageImage()
      })
    }
  }
  loadStorageImage() {
    this.fbMng.getStorageUrl(this.savePath).then((url) => {
      this.downloadImageSrc = url
    })
    this.fbMng.getStorageUrl(this.convertPath).then((url) => {
      this.convertedImageSrc = url
    })
  }

  onChangeFileInput(file: any) {
    if (file) {
      this.imageFile = file
      this.inputFileReader.readAsDataURL(file)
    } else {
      this.previewImageSrc = ''
      this.imageFile = null
    }
  }
}
</script>

<style scoped lang="scss">
.indexContainer {
  margin: 0 auto;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
