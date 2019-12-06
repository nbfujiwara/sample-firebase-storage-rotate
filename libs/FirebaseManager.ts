import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

export default class FirebaseManager {
  private static initialized = false

  public constructor() {
    const apiKey = process.env.ENV_FB_API_KEY
    const projectId = process.env.ENV_FB_PROJECT_ID
    const authDomain = projectId + '.firebaseapp.com'
    const databaseURL = 'https://' + projectId + '.firebaseio.com'
    const storageBucket = projectId + '.appspot.com'
    const messagingSenderId = process.env.ENV_FB_MESSAGE_SENDER_ID

    const config = {
      apiKey,
      authDomain,
      databaseURL,
      projectId,
      storageBucket,
      messagingSenderId
    }
    if (!FirebaseManager.initialized) {
      firebase.initializeApp(config)
      FirebaseManager.initialized = true
    }
  }

  public authorize() {
    return firebase
      .auth()
      .getRedirectResult()
      .then((result: firebase.auth.UserCredential) => {
        if (result.user) {
          return result
        } else {
          const provider = new firebase.auth.GoogleAuthProvider()
          firebase.auth().signInWithRedirect(provider)
          return null
        }
      })
  }

  public uploadFile(savePath: string, file: File | Blob): Promise<void> {
    const mountImageRef = firebase.storage().ref(savePath)
    return mountImageRef
      .put(file)
      .then((snapshot) => {
        console.log('uploaded image')
        return true
      })
      .catch((error) => {
        console.error(error)
      })
  }

  public getStorageUrl(path: string) {
    return firebase
      .storage()
      .ref(path)
      .getDownloadURL()
  }
}
