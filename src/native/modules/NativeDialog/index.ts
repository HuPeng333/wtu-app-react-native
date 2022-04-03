import { Alert, AlertButton, NativeModules, Platform } from 'react-native'

interface NativeDialogMethod {
  showDialog: (config: DialogConfig) => void
}

type DialogConfig = {
  title: string
  message?: string
  confirmBtnText?: string
  cancelBtnText?: string
  hideCancelBtn?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

const NativeDialog: NativeDialogMethod = (function () {
  let dialog: NativeDialogMethod
  if (Platform.OS === 'ios') {
    // 使用IOS原生对话框

    dialog = {
      showDialog(config) {
        const btnArr: Array<AlertButton> = [
          {
            text: config.confirmBtnText ? config.confirmBtnText : '确定',
            onPress: () => {
              config.onConfirm?.()
            },
          },
        ]
        if (!config.hideCancelBtn) {
          btnArr.push({
            text: config.cancelBtnText ? config.cancelBtnText : '取消',
            onPress: () => {
              config.onCancel?.()
            },
          })
        }
        Alert.alert(config.title, config.message, btnArr)
      },
    }
  } else {
    // expect android here
    dialog = {
      showDialog(config) {
        const { BeautifulAlertDialog } = NativeModules
        if (config.hideCancelBtn) {
          BeautifulAlertDialog.showSingleButtonDialog(
            config.title,
            config.message,
            config.confirmBtnText,
            config.onConfirm
          )
        } else {
          BeautifulAlertDialog.showDialog(
            config.title,
            config.message,
            config.confirmBtnText,
            config.cancelBtnText,
            config.onConfirm,
            config.onCancel
          )
        }
      },
    }
  }
  return dialog
})()

export default NativeDialog
