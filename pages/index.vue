<template>
  <div class="container">
    <nuxt-link to="/functions">Storage側で対応</nuxt-link>
    <v-card class="ma-2">
      <v-card-title>ローカルで行う版</v-card-title>
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

    <v-card>
      <v-card-text>
        <v-row>
          <v-col>
            <p>Upされた画像</p>
            <v-img
              :src="downloadImageSrc"
              aspect-ratio="1"
              class="downloadImg"
            ></v-img>
          </v-col>
          <v-col> </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FirebaseManager from '~/libs/FirebaseManager'
import UtilDate from '~/libs/UtilDate'
const BlueimpLoader = require('blueimp-load-image')

@Component
export default class IndexPage extends Vue {
  previewImageSrc: string = ''
  imageBlob: Blob | null
  downloadImageSrc: string = ''

  fbMng: FirebaseManager
  beforeCreate() {
    this.fbMng = new FirebaseManager()
  }
  mounted() {
    this.fbMng.authorize()
  }
  execute() {
    const savePath = 'images/' + UtilDate.format(new Date(), 'Ymd_His')
    if (this.imageBlob) {
      this.fbMng.uploadFile(savePath, this.imageBlob).then(() => {
        this.fbMng.getStorageUrl(savePath).then((url) => {
          this.downloadImageSrc = url
        })
      })
    }
  }

  onChangeFileInput(file: any) {
    if (file) {
      BlueimpLoader.parseMetaData(file, (data: any) => {
        const options = {
          maxHeight: 500,
          maxWidth: 500,
          canvas: true,
          orientation: 1
        }
        if (data.exif) {
          options.orientation = data.exif.get('Orientation')
        }
        BlueimpLoader(
          file,
          (canvas: HTMLCanvasElement) => {
            this.previewImageSrc = canvas.toDataURL(file.type)
            canvas.toBlob((blob) => {
              this.imageBlob = blob
            })
          },
          options
        )
      })
    } else {
      this.previewImageSrc = ''
      this.imageBlob = null
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
